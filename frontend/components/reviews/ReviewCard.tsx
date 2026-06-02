'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ThumbsUp, Flag, Pencil, Trash2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import { formatRelativeTime, cn } from '@/lib/utils';
import { reviewsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Review, User } from '@/types';

interface ReviewCardProps {
  review: Review;
  currentUser?: User | null;
  onEdit?:   (review: Review) => void;
  onDelete?: (id: string) => void;
  onReport?: (review: Review) => void;
  showStatus?: boolean;
}

export function ReviewCard({
  review, currentUser, onEdit, onDelete, onReport, showStatus = false,
}: ReviewCardProps) {
  const [helpful, setHelpful]           = useState(review.helpful_count);
  const [voted,   setVoted]             = useState<boolean | null>(review.user_vote ?? null);
  const [expanded, setExpanded]         = useState(false);
  const [deleteOpen, setDeleteOpen]     = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isOwner = currentUser?.id === review.user_id;
  const isMod   = currentUser?.role === 'moderator' || currentUser?.role === 'admin';
  const BODY_LIMIT = 280;
  const longBody   = (review.body?.length ?? 0) > BODY_LIMIT;

  const handleVote = async () => {
    if (!currentUser)                { toast.error('Sign in to vote'); return; }
    if (currentUser.can_vote === false) { toast.error('Your voting privileges have been restricted'); return; }
    if (isOwner)                     { toast.error('Cannot vote on your own review'); return; }
    try {
      const res = await reviewsApi.vote(review.id, true);
      if (res.data?.action === 'removed') {
        setHelpful((h) => Math.max(0, h - 1));
        setVoted(null);
      } else if (res.data?.action === 'added') {
        setHelpful((h) => h + 1);
        setVoted(true);
      }
    } catch {
      toast.error('Failed to vote');
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await reviewsApi.delete(review.id);
      toast.success('Review deleted');
      onDelete?.(review.id);
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
    }
  };

  return (
    <article className={cn(
      'rounded-2xl border bg-white p-5 shadow-card dark:bg-surface-dark-muted animate-fade-in',
      (review.user as any)?.is_verified
        ? 'border-[#1D9BF0]/30 dark:border-[#1D9BF0]/20 shadow-[0_0_0_1px_rgba(29,155,240,0.15)]'
        : 'border-slate-100 dark:border-white/8'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <Avatar
            src={review.user?.avatar_url}
            name={review.user?.full_name || review.user?.username}
            size="md"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {review.user?.username || review.user?.full_name || 'Anonymous'}
              </span>
              {/* Verified reviewer badge — Twitter-style blue tick */}
              {(review.user as any)?.is_verified && (
                <VerifiedBadge size="sm" />
              )}
              {review.is_verified_purchase && (
                <Badge variant="success" size="sm">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Verified purchase
                </Badge>
              )}
              {showStatus && <StatusBadge status={review.status} />}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{formatRelativeTime(review.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <StarRating rating={review.rating} size="sm" />
          <span className="ml-1 text-sm font-bold text-slate-800 dark:text-slate-100">{review.rating}.0</span>
        </div>
      </div>

      {/* Title */}
      <h4 className="mb-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
        {review.title}
      </h4>

      {/* Body */}
      <p className={cn('text-sm text-slate-600 dark:text-slate-300 leading-relaxed', !expanded && longBody && 'line-clamp-3')}>
        {review.body}
      </p>
      {longBody && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
        >
          {expanded ? <><ChevronUp className="h-3 w-3" />Show less</> : <><ChevronDown className="h-3 w-3" />Read more</>}
        </button>
      )}

      {/* Pros / Cons */}
      {((review.pros?.length ?? 0) > 0 || (review.cons?.length ?? 0) > 0) && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(review.pros?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-semibold text-emerald-600 mb-1.5">Pros</p>
              <ul className="space-y-1">
                {review.pros!.map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <span className="text-emerald-500 mt-0.5">+</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(review.cons?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-500 mb-1.5">Cons</p>
              <ul className="space-y-1">
                {review.cons!.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <span className="text-red-400 mt-0.5">−</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Images */}
      {(review.images?.length ?? 0) > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {review.images!.map((img) => (
            <div key={img.id} className="relative h-20 w-20 overflow-hidden rounded-lg border border-slate-100">
              <Image src={img.url} alt="Review image" fill sizes="80px" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-slate-50 dark:border-white/8">
        <button
          onClick={handleVote}
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium rounded-lg px-2.5 py-1.5 transition-colors',
            voted
              ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400'
              : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10'
          )}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          Helpful ({helpful})
        </button>

        <div className="flex items-center gap-1">
          {isOwner && (
            <>
              <Button variant="ghost" size="xs" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => onEdit?.(review)}>
                Edit
              </Button>
              <Button variant="ghost" size="xs" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setDeleteOpen(true)}
                className="text-red-500 hover:bg-red-50 hover:text-red-600">
                Delete
              </Button>
            </>
          )}
          {isMod && !isOwner && (
            <Button variant="ghost" size="xs" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setDeleteOpen(true)}
              className="text-red-500 hover:bg-red-50">
              Remove
            </Button>
          )}
          {!isOwner && currentUser && (
            <button
              onClick={() => onReport?.(review)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Flag className="h-3.5 w-3.5" />
              Report
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Review"
        description="This action cannot be undone. Your review will be permanently deleted."
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </article>
  );
}
