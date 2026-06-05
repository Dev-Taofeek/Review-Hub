'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { reviewsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Review } from '@/types';

interface ReviewFormProps {
  productId: string;
  onSuccess: (review: Review) => void;
  onCancel?: () => void;
  existingReview?: Review;
}

export function ReviewForm({ productId, onSuccess, onCancel, existingReview }: ReviewFormProps) {
  const [loading, setLoading] = useState(false);
  const [rating, setRating]   = useState(existingReview?.rating ?? 0);
  const [title,  setTitle]    = useState(existingReview?.title  ?? '');
  const [body,   setBody]     = useState(existingReview?.body   ?? '');
  const [pros,   setPros]     = useState<string[]>(existingReview?.pros ?? ['']);
  const [cons,   setCons]     = useState<string[]>(existingReview?.cons ?? ['']);

  const updateList = (
    list: string[], setList: (l: string[]) => void, idx: number, value: string
  ) => {
    const next = [...list];
    next[idx] = value;
    setList(next);
  };

  const addItem = (list: string[], setList: (l: string[]) => void) => {
    if (list.length < 5) setList([...list, '']);
  };

  const removeItem = (list: string[], setList: (l: string[]) => void, idx: number) => {
    setList(list.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }
    if (!title.trim()) { toast.error('Please add a title'); return; }
    if (body.trim().length < 10) { toast.error('Review body must be at least 10 characters'); return; }

    setLoading(true);
    try {
      const payload = {
        rating,
        title: title.trim(),
        body:  body.trim(),
        pros:  pros.filter((p) => p.trim()),
        cons:  cons.filter((c) => c.trim()),
      };

      let result: Review;
      if (existingReview) {
        const res = await reviewsApi.update(existingReview.id, payload);
        result = res.data!;
        toast.success('Review updated');
      } else {
        const res = await reviewsApi.create(productId, payload);
        result = res.data!.review;
        const status = result.status;
        if (status === 'published')   toast.success('Review published!');
        else if (status === 'flagged') toast('Review flagged for moderation', { icon: '⚠️' });
        else                           toast('Review submitted for review', { icon: '⏳' });
      }
      onSuccess(result);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
        {rating > 0 && (
          <p className="mt-1 text-xs text-slate-500">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </p>
        )}
      </div>

      <Input
        label="Review Title" required
        placeholder="Summarize your experience"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
      />

      <Textarea
        label="Your Review" required
        placeholder="Share your thoughts about the product. What did you like or dislike? How was the quality?"
        rows={5}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        hint={`${body.length}/5000 characters`}
        maxLength={5000}
      />

      {/* Pros */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Pros <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <div className="flex flex-col gap-2">
          {pros.map((pro, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder={`Pro ${i + 1}`}
                value={pro}
                onChange={(e) => updateList(pros, setPros, i, e.target.value)}
                className="flex-1"
              />
              {pros.length > 1 && (
                <button type="button" onClick={() => removeItem(pros, setPros, i)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {pros.length < 5 && (
            <button type="button" onClick={() => addItem(pros, setPros)}
              className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium">
              <Plus className="h-3.5 w-3.5" /> Add pro
            </button>
          )}
        </div>
      </div>

      {/* Cons */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Cons <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <div className="flex flex-col gap-2">
          {cons.map((con, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder={`Con ${i + 1}`}
                value={con}
                onChange={(e) => updateList(cons, setCons, i, e.target.value)}
                className="flex-1"
              />
              {cons.length > 1 && (
                <button type="button" onClick={() => removeItem(cons, setCons, i)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {cons.length < 5 && (
            <button type="button" onClick={() => addItem(cons, setCons)}
              className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium">
              <Plus className="h-3.5 w-3.5" /> Add con
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 dark:border-white/[0.07]">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        )}
        <Button type="submit" loading={loading}>
          {existingReview ? 'Update Review' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
}
