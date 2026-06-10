'use client';

import { useState } from 'react';
import { ModerationCard } from '@/components/moderation/ModerationCard';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { moderationApi } from '@/lib/api';
import { useEffect, useCallback } from 'react';
import { CheckCircle } from 'lucide-react';
import type { Review } from '@/types';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending Review' },
  { value: 'flagged', label: 'Flagged'         },
  { value: 'published', label: 'Published'     },
  { value: 'rejected', label: 'Rejected'       },
];

export default function ModerationReviewsPage() {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [total, setTotal]       = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]         = useState(1);
  const [status, setStatus]     = useState('pending');
  const [loading, setLoading]   = useState(true);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await moderationApi.getQueue({ status, page: String(page), limit: '12' });
      setReviews(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const handleAction = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Review Queue <span className="text-slate-400 font-normal">({total})</span>
        </h2>
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="w-44"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<CheckCircle />}
          title={`No ${status} reviews`}
          description={status === 'pending' ? 'The moderation queue is clear!' : `No reviews with status "${status}".`}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {reviews.map((review) => (
              <ModerationCard key={review.id} review={review} onAction={handleAction} />
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
