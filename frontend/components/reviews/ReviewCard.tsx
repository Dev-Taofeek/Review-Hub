'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ThumbsUp, Flag, Pencil, Trash2, CheckCircle2, ChevronDown, Star, Shield } from 'lucide-react';
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

/* Rating color system — precise, intentional */
const RATING_SYSTEM: Record<number, { label: string; accent: string; bg: string; border: string }> = {
  5: { label: 'Exceptional', accent: '#00E5A0', bg: 'rgba(0,229,160,0.08)',  border: 'rgba(0,229,160,0.18)'  },
  4: { label: 'Excellent',   accent: '#34D399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.18)' },
  3: { label: 'Good',         accent: '#FBBF24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.18)' },
  2: { label: 'Mixed',        accent: '#F97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.18)' },
  1: { label: 'Poor',          accent: '#FF6B6B', bg: 'rgba(255,107,107,0.08)', border: 'rgba(255,107,107,0.18)' },
};

interface ReviewCardProps {
  review: Review;
  currentUser?: User | null;
  onEdit?:   (review: Review) => void;
  onDelete?: (id: string) => void;
  onReport?: (review: Review) => void;
  showStatus?: boolean;
}

export function ReviewCard({ review, currentUser, onEdit, onDelete, onReport, showStatus = false }: ReviewCardProps) {
  const [helpful,       setHelpful]       = useState(review.helpful_count);
  const [voted,         setVoted]         = useState<boolean | null>(review.user_vote ?? null);
  const [expanded,      setExpanded]      = useState(false);
  const [deleteOpen,    setDeleteOpen]    = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [voteLoading,   setVoteLoading]   = useState(false);
  const reduced = useReducedMotion();

  const isOwner    = currentUser?.id === review.user_id;
  const isMod      = currentUser?.role === 'moderator' || currentUser?.role === 'admin';
  const isVerified = (review.user as any)?.is_verified;
  const LIMIT      = 300;
  const longBody   = (review.body?.length ?? 0) > LIMIT;
  const rs         = RATING_SYSTEM[review.rating] ?? RATING_SYSTEM[3];

  /* Signal weight: reviews with more helpful votes get stronger visual treatment */
  const signalWeight = helpful >= 10 ? 'high' : helpful >= 3 ? 'medium' : 'low';

  const handleVote = async () => {
    if (!currentUser)                   { toast.error('Sign in to vote'); return; }
    if (currentUser.can_vote === false) { toast.error('Voting privileges restricted'); return; }
    if (isOwner)                        { toast.error('Cannot vote on your own review'); return; }
    setVoteLoading(true);
    try {
      const res = await reviewsApi.vote(review.id, true);
      if (res.data?.action === 'removed') { setHelpful(h => Math.max(0,h-1)); setVoted(null); }
      else if (res.data?.action === 'added') { setHelpful(h => h+1); setVoted(true); }
    } catch { toast.error('Failed to vote'); }
    finally  { setVoteLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try   { await reviewsApi.delete(review.id); toast.success('Review deleted'); onDelete?.(review.id); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleteLoading(false); setDeleteOpen(false); }
  };

  return (
    <motion.article
      variants={staggerItem}
      whileHover={reduced ? {} : { y: -3, transition: { duration: 0.18, ease: 'easeOut' } }}
      className={cn(
        'relative rounded-2xl overflow-hidden transition-all duration-300',
        /* Base light */
        'bg-white border border-slate-200/80',
        'shadow-[0_1px_3px_rgba(0,0,0,0.07),0_6px_20px_rgba(0,0,0,0.05)]',
        'hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]',
        /* Base dark */
        'dark:bg-[#0D1020] dark:border-white/[0.07]',
        'dark:[box-shadow:0_0_0_1px_rgba(255,255,255,0.03)_inset,0_1px_0_rgba(255,255,255,0.05)_inset,0_8px_24px_rgba(0,0,0,0.35)]',
        'dark:hover:[box-shadow:0_0_0_1px_rgba(255,255,255,0.05)_inset,0_1px_0_rgba(255,255,255,0.08)_inset,0_12px_32px_rgba(0,0,0,0.45)]',
        /* High-signal: verified reviews get special treatment */
        signalWeight === 'high' && 'dark:border-[rgba(0,229,160,0.12)]',
      )}
    >
      {/* Rating accent line — visual signal strength indicator */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${rs.accent}, transparent 60%)`, opacity: 0.8 }} />

      {/* High-signal badge — reviews with many helpful votes get a crown */}
      {signalWeight === 'high' && (
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', color: '#00E5A0' }}>
          <Shield className="h-2.5 w-2.5" aria-hidden="true" />
          Top Signal
        </div>
      )}

      <div className="p-5">
        {/* ── Header ──────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar src={review.user?.avatar_url} name={review.user?.full_name || review.user?.username} size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {review.user?.username || review.user?.full_name || 'Anonymous'}
                </span>
                {isVerified && <VerifiedBadge size="sm" />}
                {review.is_verified_purchase && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,229,160,0.10)', border: '1px solid rgba(0,229,160,0.22)', color: '#00E5A0' }}>
                    <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{formatRelativeTime(review.created_at)}</p>
            </div>
          </div>

          {/* Rating badge */}
          <div className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-xl"
            style={{ background: rs.bg, border: `1px solid ${rs.border}` }}>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={cn('h-3 w-3', s <= review.rating ? 'fill-current text-current' : 'fill-slate-200 dark:fill-white/10 text-transparent')}
                  style={s <= review.rating ? { color: rs.accent } : {}} />
              ))}
            </div>
            <span className="text-data text-xs font-black" style={{ color: rs.accent }}>{review.rating}.0</span>
          </div>
        </div>

        {/* ── Title ───────────────────────────────────── */}
        <h4 className="text-[15px] font-bold text-slate-900 dark:text-white leading-snug mb-2">
          {review.title}
        </h4>

        {/* ── Body ────────────────────────────────────── */}
        <div>
          <AnimatePresence initial={false}>
            <motion.p
              key={expanded ? 'x' : 'c'}
              initial={reduced ? {} : { opacity: 0 }}
              animate={reduced ? {} : { opacity: 1 }}
              transition={{ duration: 0.2 }}
              className={cn('text-sm leading-relaxed text-slate-600 dark:text-slate-300', !expanded && longBody && 'line-clamp-3')}
            >
              {review.body}
            </motion.p>
          </AnimatePresence>
          {longBody && (
            <button onClick={() => setExpanded(!expanded)} aria-expanded={expanded}
              className="mt-1.5 flex items-center gap-1 text-xs font-bold transition-colors"
              style={{ color: 'var(--signal)' }}>
              <motion.span animate={reduced ? {} : { rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="h-3.5 w-3.5" />
              </motion.span>
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* ── Pros / Cons — pill tags ──────────────────── */}
        {((review.pros?.length ?? 0) > 0 || (review.cons?.length ?? 0) > 0) && (
          <div className="mt-4 flex flex-wrap gap-4">
            {(review.pros?.length ?? 0) > 0 && (
              <div className="flex-1 min-w-[140px]">
                <p className="text-label-mono mb-2" style={{ color: '#00E5A0' }}>Pros</p>
                <div className="flex flex-wrap gap-1.5">
                  {review.pros!.map((p, i) => (
                    <span key={i} className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.18)', color: '#00B880' }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(review.cons?.length ?? 0) > 0 && (
              <div className="flex-1 min-w-[140px]">
                <p className="text-label-mono mb-2" style={{ color: '#FF6B6B' }}>Cons</p>
                <div className="flex flex-wrap gap-1.5">
                  {review.cons!.map((c, i) => (
                    <span key={i} className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.18)', color: '#FF6B6B' }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Images ──────────────────────────────────── */}
        {(review.images?.length ?? 0) > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {review.images!.map((img) => (
              <div key={img.id} className="relative h-20 w-20 overflow-hidden rounded-xl"
                style={{ border: '1px solid var(--wire)' }}>
                <Image src={img.url} alt="Review image" fill sizes="80px" className="object-cover" />
              </div>
            ))}
          </div>
        )}

        {showStatus && <div className="mt-3"><StatusBadge status={review.status} /></div>}

        {/* ── Footer ──────────────────────────────────── */}
        <div className="mt-4 pt-3 flex items-center justify-between gap-2"
          style={{ borderTop: '1px solid var(--line)' }}>

          {/* Helpful vote — animated */}
          <motion.button
            onClick={handleVote}
            disabled={voteLoading}
            whileTap={reduced ? {} : { scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            aria-pressed={voted === true}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200"
            style={voted ? {
              background: 'rgba(0,229,160,0.1)',
              border: '1px solid rgba(0,229,160,0.22)',
              color: '#00E5A0',
            } : {
              background: 'transparent',
              border: '1px solid transparent',
              color: 'var(--text-3)',
            }}
          >
            <ThumbsUp className={cn('h-3.5 w-3.5', voted && 'fill-current')} aria-hidden="true" />
            Helpful
            {helpful > 0 && (
              <span className="text-data px-1.5 py-0.5 rounded-md text-[10px] font-black"
                style={voted
                  ? { background: 'rgba(0,229,160,0.15)', color: '#00E5A0' }
                  : { background: 'var(--raised)', color: 'var(--text-2)' }
                }>
                {helpful}
              </span>
            )}
          </motion.button>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {isOwner && (
              <>
                <button onClick={() => onEdit?.(review)} className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-2 rounded-xl transition-colors"
                  style={{ color: 'var(--text-2)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--raised)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <Pencil className="h-3 w-3" aria-hidden="true" /> Edit
                </button>
                <button onClick={() => setDeleteOpen(true)} className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-2 rounded-xl transition-colors"
                  style={{ color: '#FF6B6B' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,107,107,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <Trash2 className="h-3 w-3" aria-hidden="true" /> Delete
                </button>
              </>
            )}
            {isMod && !isOwner && (
              <button onClick={() => setDeleteOpen(true)} className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-2 rounded-xl"
                style={{ color: '#FF6B6B' }}>
                <Trash2 className="h-3 w-3" aria-hidden="true" /> Remove
              </button>
            )}
            {!isOwner && currentUser && (
              <button onClick={() => onReport?.(review)} aria-label="Report this review"
                className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-2 rounded-xl transition-colors"
                style={{ color: 'var(--text-3)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FF6B6B'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,107,107,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <Flag className="h-3.5 w-3.5" aria-hidden="true" /> Report
              </button>
            )}
          </div>
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
