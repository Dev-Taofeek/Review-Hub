'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Flag, AlertTriangle } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import { formatRelativeTime } from '@/lib/utils';
import { moderationApi } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Review } from '@/types';

interface ModerationCardProps {
  review: Review;
  onAction: (id: string, action: 'approved' | 'rejected' | 'flagged') => void;
}

export function ModerationCard({ review, onAction }: ModerationCardProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handle = async (action: 'approve' | 'reject' | 'flag') => {
    setLoading(action);
    try {
      if      (action === 'approve') await moderationApi.approve(review.id);
      else if (action === 'reject')  await moderationApi.reject(review.id);
      else                           await moderationApi.flag(review.id);

      const map = { approve: 'approved', reject: 'rejected', flag: 'flagged' } as const;
      toast.success(`Review ${map[action]}`);
      onAction(review.id, map[action]);
    } catch {
      toast.error('Action failed');
    } finally {
      setLoading(null);
    }
  };

  const spamScore = review.spam_score ?? 0;

  return (
    <article className="rounded-2xl border border-slate-100 bg-white shadow-card dark:bg-surface-dark-muted dark:border-white/8 overflow-hidden">
      {/* Spam score bar */}
      {spamScore > 0 && (
        <div className="h-1 w-full bg-slate-100">
          <div
            className={`h-full transition-all ${spamScore >= 70 ? 'bg-red-500' : spamScore >= 30 ? 'bg-amber-400' : 'bg-emerald-400'}`}
            style={{ width: `${spamScore}%` }}
          />
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Avatar src={review.user?.avatar_url} name={review.user?.full_name || review.user?.username} size="sm" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {review.user?.username || 'Anonymous'}
              </p>
              <p className="text-xs text-slate-400">{formatRelativeTime(review.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            <StatusBadge status={review.status} />
            {spamScore >= 30 && (
              <Badge variant={spamScore >= 70 ? 'danger' : 'warning'} size="sm">
                <AlertTriangle className="h-3 w-3" />
                Spam {spamScore}%
              </Badge>
            )}
          </div>
        </div>

        {/* Product */}
        {review.product && (
          <p className="text-xs text-slate-500 mb-2">
            Product: <span className="font-medium text-slate-700 dark:text-slate-300">{(review.product as { name?: string }).name}</span>
          </p>
        )}

        <div className="flex items-center gap-2 mb-2">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{review.title}</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4">{review.body}</p>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-50 dark:border-white/8">
          <Button
            size="sm" variant="secondary"
            icon={<CheckCircle className="h-4 w-4 text-emerald-600" />}
            loading={loading === 'approve'}
            disabled={!!loading || review.status === 'published'}
            onClick={() => handle('approve')}
            className="flex-1"
          >
            Approve
          </Button>
          <Button
            size="sm" variant="secondary"
            icon={<Flag className="h-4 w-4 text-amber-600" />}
            loading={loading === 'flag'}
            disabled={!!loading || review.status === 'flagged'}
            onClick={() => handle('flag')}
            className="flex-1"
          >
            Flag
          </Button>
          <Button
            size="sm" variant="secondary"
            icon={<XCircle className="h-4 w-4 text-red-500" />}
            loading={loading === 'reject'}
            disabled={!!loading || review.status === 'rejected'}
            onClick={() => handle('reject')}
            className="flex-1 text-red-600"
          >
            Reject
          </Button>
        </div>
      </div>
    </article>
  );
}
