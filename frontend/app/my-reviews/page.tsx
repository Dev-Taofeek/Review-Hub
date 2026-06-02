'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { useMyReviews } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { ReviewCardSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Review } from '@/types';

export default function MyReviewsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { reviews, total, totalPages, loading } = useMyReviews(page);
  const [localReviews, setLocalReviews] = useState<Review[] | null>(null);

  const displayed = localReviews ?? reviews;

  const handleDelete = (id: string) => {
    setLocalReviews((prev) => (prev ?? reviews).filter((r) => r.id !== id));
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-14 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Reviews</h1>
        <p className="text-sm text-slate-500 mt-1">{total} review{total !== 1 ? 's' : ''} submitted</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => <ReviewCardSkeleton key={i} />)}
        </div>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={<BookOpen />}
          title="No reviews yet"
          description="You haven't written any reviews yet. Browse products to share your experience."
          action={{ label: 'Browse Products', onClick: () => router.push('/products') }}
        />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {displayed.map((review) => (
              <div key={review.id}>
                {review.product && (
                  <div className="mb-1.5 px-1">
                    <Link
                      href={`/products/${(review.product as { slug?: string }).slug ?? review.product_id}`}
                      className="text-xs font-medium text-brand-600 hover:text-brand-700"
                    >
                      {(review.product as { name?: string }).name ?? 'Product'}
                    </Link>
                  </div>
                )}
                <ReviewCard
                  review={review}
                  currentUser={user}
                  onDelete={handleDelete}
                  showStatus
                />
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
