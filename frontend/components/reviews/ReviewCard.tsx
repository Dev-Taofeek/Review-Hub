'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, ChevronDown, Flag, Pencil, Star, ThumbsUp, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { ConfirmModal } from '@/components/ui/Modal';
import { formatRelativeTime, cn } from '@/lib/utils';
import { reviewsApi } from '@/lib/api';
import type { Review, User } from '@/types';

interface ReviewCardProps {
  review: Review;
  currentUser?: User | null;
  onEdit?: (review: Review) => void;
  onDelete?: (id: string) => void;
  onReport?: (review: Review) => void;
  showStatus?: boolean;
}

const ratingText: Record<number, string> = {
  5: 'Excellent',
  4: 'Very good',
  3: 'Mixed',
  2: 'Weak',
  1: 'Poor',
};

export function ReviewCard({ review, currentUser, onEdit, onDelete, onReport, showStatus = false }: ReviewCardProps) {
  const [helpful, setHelpful] = useState(review.helpful_count);
  const [voted, setVoted] = useState<boolean | null>(review.user_vote ?? null);
  const [expanded, setExpanded] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);

  const isOwner = currentUser?.id === review.user_id;
  const isVerified = (review.user as any)?.is_verified;
  const longBody = (review.body?.length ?? 0) > 320;

  const handleVote = async () => {
    if (!currentUser) { toast.error('Sign in to vote'); return; }
    if (currentUser.can_vote === false) { toast.error('Voting privileges restricted'); return; }
    if (isOwner) { toast.error('Cannot vote on your own review'); return; }
    setVoteLoading(true);
    try {
      const res = await reviewsApi.vote(review.id, true);
      if (res.data?.action === 'removed') { setHelpful((h) => Math.max(0, h - 1)); setVoted(null); }
      else if (res.data?.action === 'added') { setHelpful((h) => h + 1); setVoted(true); }
    } catch {
      toast.error('Failed to vote');
    } finally {
      setVoteLoading(false);
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
    <article className="border border-[var(--border)] bg-[var(--surface)]">
      <div className="grid gap-5 p-5 sm:grid-cols-[180px_1fr]">
        <aside className="border-b border-[var(--border)] pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-5">
          <div className="flex items-center gap-3 sm:block">
            <Avatar src={review.user?.avatar_url} name={review.user?.full_name || review.user?.username} size="md" />
            <div className="min-w-0 sm:mt-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="truncate text-sm font-black text-[var(--foreground)]">
                  {review.user?.username || review.user?.full_name || 'Anonymous'}
                </p>
                {isVerified && <VerifiedBadge size="sm" />}
              </div>
              <p className="mt-1 text-xs font-bold text-[var(--muted)]">{formatRelativeTime(review.created_at)}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'h-4 w-4',
                    star <= review.rating
                      ? 'fill-[var(--secondary)] text-[var(--secondary)]'
                      : 'fill-[var(--border)] text-[var(--border)]'
                  )}
                />
              ))}
            </div>
            <p className="mt-2 text-sm font-black text-[var(--foreground)]">{ratingText[review.rating] || 'Rated'}</p>
            {review.is_verified_purchase && (
              <p className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[var(--primary)]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified purchase
              </p>
            )}
            {showStatus && <div className="mt-3"><StatusBadge status={review.status} /></div>}
          </div>
        </aside>

        <div>
          <h4 className="text-lg font-black leading-snug text-[var(--foreground)]">{review.title}</h4>
          <p className={cn('mt-3 text-sm leading-7 text-[var(--muted)]', !expanded && longBody && 'line-clamp-3')}>
            {review.body}
          </p>
          {longBody && (
            <button onClick={() => setExpanded(!expanded)} aria-expanded={expanded} className="mt-2 flex items-center gap-1 text-xs font-black text-[var(--primary)]">
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-180')} />
              {expanded ? 'Show less' : 'Read full review'}
            </button>
          )}

          {((review.pros?.length ?? 0) > 0 || (review.cons?.length ?? 0) > 0) && (
            <div className="mt-5 grid gap-4 border-y border-[var(--border)] py-4 sm:grid-cols-2">
              {(review.pros?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--primary)]">What worked</p>
                  <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
                    {review.pros!.map((pro, index) => <li key={index}>+ {pro}</li>)}
                  </ul>
                </div>
              )}
              {(review.cons?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--danger)]">What did not</p>
                  <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
                    {review.cons!.map((con, index) => <li key={index}>- {con}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {(review.images?.length ?? 0) > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {review.images!.map((img) => (
                <div key={img.id} className="relative h-20 w-20 overflow-hidden border border-[var(--border)]">
                  <Image src={img.url} alt="Review evidence" fill sizes="80px" className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
            <button
              onClick={handleVote}
              disabled={voteLoading}
              aria-pressed={voted === true}
              className={cn(
                'flex items-center gap-2 border px-3 py-2 text-xs font-extrabold transition-colors',
                voted
                  ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]'
                  : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)]'
              )}
            >
              <ThumbsUp className={cn('h-3.5 w-3.5', voted && 'fill-current')} />
              Helpful {helpful > 0 && <span className="tabular-nums">{helpful}</span>}
            </button>

            <div className="flex items-center gap-2">
              {isOwner && (
                <>
                  <button onClick={() => onEdit?.(review)} className="flex items-center gap-1.5 px-2 py-2 text-xs font-extrabold text-[var(--muted)] hover:text-[var(--foreground)]">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button onClick={() => setDeleteOpen(true)} className="flex items-center gap-1.5 px-2 py-2 text-xs font-extrabold text-[var(--danger)]">
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </>
              )}
              {!isOwner && onReport && (
                <button onClick={() => onReport(review)} className="flex items-center gap-1.5 px-2 py-2 text-xs font-extrabold text-[var(--muted)] hover:text-[var(--danger)]">
                  <Flag className="h-3.5 w-3.5" />
                  Report
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete review?"
        description="This review will be permanently removed."
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleteLoading}
      />
    </article>
  );
}
