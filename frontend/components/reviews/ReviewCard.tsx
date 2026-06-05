'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ThumbsUp, Flag, Pencil, Trash2, CheckCircle2, ChevronDown, Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import { formatRelativeTime, cn } from '@/lib/utils';
import { reviewsApi } from '@/lib/api';
import { staggerItem } from '@/lib/animations';
import toast from 'react-hot-toast';
import type { Review, User } from '@/types';

const RATING_COLORS: Record<number, { bg: string; text: string; glow: string }> = {
  5: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
  4: { bg: 'bg-lime-500/15',    text: 'text-lime-400',    glow: 'shadow-lime-500/20'    },
  3: { bg: 'bg-amber-500/15',   text: 'text-amber-400',   glow: 'shadow-amber-500/20'   },
  2: { bg: 'bg-orange-500/15',  text: 'text-orange-400',  glow: 'shadow-orange-500/20'  },
  1: { bg: 'bg-red-500/15',     text: 'text-red-400',     glow: 'shadow-red-500/20'     },
};

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
  const [helpful,       setHelpful]       = useState(review.helpful_count);
  const [voted,         setVoted]         = useState<boolean | null>(review.user_vote ?? null);
  const [expanded,      setExpanded]      = useState(false);
  const [deleteOpen,    setDeleteOpen]    = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [voteLoading,   setVoteLoading]   = useState(false);
  const reduced = useReducedMotion();

  const isOwner   = currentUser?.id === review.user_id;
  const isMod     = currentUser?.role === 'moderator' || currentUser?.role === 'admin';
  const isVerified = (review.user as any)?.is_verified;
  const LIMIT      = 280;
  const longBody   = (review.body?.length ?? 0) > LIMIT;
  const ratingMeta = RATING_COLORS[review.rating] ?? RATING_COLORS[3];

  const handleVote = async () => {
    if (!currentUser)                  { toast.error('Sign in to vote'); return; }
    if (currentUser.can_vote === false) { toast.error('Your voting privileges have been restricted'); return; }
    if (isOwner)                       { toast.error('Cannot vote on your own review'); return; }
    setVoteLoading(true);
    try {
      const res = await reviewsApi.vote(review.id, true);
      if (res.data?.action === 'removed') { setHelpful((h) => Math.max(0, h - 1)); setVoted(null); }
      else if (res.data?.action === 'added')   { setHelpful((h) => h + 1); setVoted(true); }
    } catch { toast.error('Failed to vote'); }
    finally  { setVoteLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await reviewsApi.delete(review.id); toast.success('Review deleted'); onDelete?.(review.id); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleteLoading(false); setDeleteOpen(false); }
  };

  return (
    <motion.article
      variants={staggerItem}
      whileHover={reduced ? {} : { y: -3, transition: { duration: 0.18, ease: 'easeOut' } }}
      className={cn(
        'group relative rounded-2xl p-5 overflow-hidden',
        'bg-white dark:bg-[#0c1526]',
        'border transition-all duration-300',
        isVerified
          ? 'border-blue-200/60 dark:border-[#1D9BF0]/15 shadow-sm shadow-blue-100/40 dark:shadow-none'
          : 'border-slate-200/80 dark:border-white/[0.07] shadow-sm dark:shadow-none',
        'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/40',
        'dark:hover:border-white/[0.11]',
      )}
    >
      {/* Verified indicator strip */}
      {isVerified && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500" />
      )}

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={review.user?.avatar_url} name={review.user?.full_name || review.user?.username} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {review.user?.username || review.user?.full_name || 'Anonymous'}
              </span>
              {isVerified && <VerifiedBadge size="sm" />}
              {review.is_verified_purchase && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/30 px-1.5 py-0.5 rounded-full">
                  <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{formatRelativeTime(review.created_at)}</p>
          </div>
        </div>

        {/* Rating badge */}
        <div className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-xl shrink-0 shadow-sm',
          ratingMeta.bg, ratingMeta.glow
        )}>
          <Star className={cn('h-3.5 w-3.5 fill-current', ratingMeta.text)} aria-hidden="true" />
          <span className={cn('text-sm font-black tabular-nums', ratingMeta.text)}>{review.rating}.0</span>
        </div>
      </div>

      {/* ── Title ───────────────────────────────────────── */}
      <h4 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 leading-snug mb-2">
        {review.title}
      </h4>

      {/* ── Body with AnimatePresence expand ────────────── */}
      <div className="relative">
        <AnimatePresence initial={false}>
          <motion.p
            key={expanded ? 'expanded' : 'collapsed'}
            initial={reduced ? {} : { opacity: 0 }}
            animate={reduced ? {} : { opacity: 1 }}
            exit={reduced ? {} : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'text-sm text-slate-600 dark:text-slate-300 leading-relaxed',
              !expanded && longBody && 'line-clamp-3'
            )}
          >
            {review.body}
          </motion.p>
        </AnimatePresence>
        {longBody && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            aria-expanded={expanded}
          >
            <motion.div
              animate={reduced ? {} : { rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </motion.div>
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* ── Pros / Cons as pills ────────────────────────── */}
      {((review.pros?.length ?? 0) > 0 || (review.cons?.length ?? 0) > 0) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {(review.pros?.length ?? 0) > 0 && (
            <div className="flex-1 min-w-[140px]">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-2">
                👍 Pros
              </p>
              <div className="flex flex-wrap gap-1.5">
                {review.pros!.map((p, i) => (
                  <span key={i} className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/30 px-2 py-0.5 rounded-full">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(review.cons?.length ?? 0) > 0 && (
            <div className="flex-1 min-w-[140px]">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500 dark:text-red-400 mb-2">
                👎 Cons
              </p>
              <div className="flex flex-wrap gap-1.5">
                {review.cons!.map((c, i) => (
                  <span key={i} className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/30 px-2 py-0.5 rounded-full">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Images ──────────────────────────────────────── */}
      {(review.images?.length ?? 0) > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.images!.map((img) => (
            <div key={img.id} className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200/60 dark:border-white/[0.08] shadow-sm">
              <Image src={img.url} alt="Review image" fill sizes="80px" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {showStatus && (
        <div className="mt-3">
          <StatusBadge status={review.status} />
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────── */}
      <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
        <motion.button
          onClick={handleVote}
          disabled={voteLoading}
          whileTap={reduced ? {} : { scale: 0.93 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          aria-pressed={voted === true}
          className={cn(
            'flex items-center gap-2 text-xs font-semibold rounded-xl px-3 py-2 transition-all duration-200',
            voted
              ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800/40 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.07] border border-transparent hover:border-slate-200 dark:hover:border-white/10'
          )}
        >
          <ThumbsUp className={cn('h-3.5 w-3.5', voted && 'fill-brand-500 text-brand-500')} aria-hidden="true" />
          Helpful
          {helpful > 0 && (
            <span className={cn(
              'tabular-nums px-1.5 py-0.5 rounded-full text-[10px] font-black',
              voted
                ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300'
                : 'bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-400'
            )}>
              {helpful}
            </span>
          )}
        </motion.button>

        <div className="flex items-center gap-1">
          {isOwner && (
            <>
              <Button variant="ghost" size="xs" icon={<Pencil className="h-3 w-3" aria-hidden="true" />} onClick={() => onEdit?.(review)}>
                Edit
              </Button>
              <Button variant="ghost" size="xs" icon={<Trash2 className="h-3 w-3" aria-hidden="true" />} onClick={() => setDeleteOpen(true)}
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600">
                Delete
              </Button>
            </>
          )}
          {isMod && !isOwner && (
            <Button variant="ghost" size="xs" icon={<Trash2 className="h-3 w-3" aria-hidden="true" />} onClick={() => setDeleteOpen(true)}
              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
              Remove
            </Button>
          )}
          {!isOwner && currentUser && (
            <button
              onClick={() => onReport?.(review)}
              aria-label="Report this review"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-500 px-2.5 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent hover:border-red-200/60 dark:hover:border-red-800/30 transition-all duration-150"
            >
              <Flag className="h-3.5 w-3.5" aria-hidden="true" />
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
        description="This action cannot be undone. Your review will be permanently removed."
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </motion.article>
  );
}
