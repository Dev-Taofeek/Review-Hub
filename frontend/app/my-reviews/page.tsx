'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, Plus, Star } from 'lucide-react';
import { useMyReviews } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { ReviewCardSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { staggerContainer, staggerItem, pageTransition } from '@/lib/animations';
import type { Review } from '@/types';

export default function MyReviewsPage() {
  const { user } = useAuth();
  const router   = useRouter();
  const [page, setPage]           = useState(1);
  const { reviews, total, totalPages, loading } = useMyReviews(page);
  const [localReviews, setLocalReviews]         = useState<Review[] | null>(null);
  const reduced = useReducedMotion();

  const displayed = localReviews ?? reviews;
  const handleDelete = (id: string) =>
    setLocalReviews((prev) => (prev ?? reviews).filter((r) => r.id !== id));

  return (
    <motion.div
      variants={reduced ? {} : pageTransition}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[var(--background)]"
    >
      <div className="mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18 py-8 sm:py-10">

        {/* Header */}
        <motion.div
          variants={reduced ? {} : staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div variants={reduced ? {} : staggerItem} className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-10 w-10 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-emerald-900/20">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">My Reviews</h1>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 ml-[52px]">
                {total > 0 ? `${total} review${total !== 1 ? 's' : ''} submitted` : 'No reviews yet'}
              </p>
            </div>
            <Link href="/products">
              <Button size="sm" icon={<Plus className="h-4 w-4" />}>
                Write a Review
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => <ReviewCardSkeleton key={i} />)}
          </div>
        ) : displayed.length === 0 ? (
          <motion.div
            variants={reduced ? {} : staggerItem}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-slate-200/60 dark:border-white/[0.07] bg-white dark:bg-[#0c1526] shadow-sm p-16 text-center"
          >
            <div className="inline-flex h-20 w-20 rounded-3xl bg-violet-50 dark:bg-violet-950/30 items-center justify-center mx-auto mb-5">
              <Star className="h-10 w-10 text-violet-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No reviews yet</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-6 max-w-xs mx-auto">
              You haven't written any reviews yet. Browse products and share your experience.
            </p>
            <Button onClick={() => router.push('/products')}>Browse Products</Button>
          </motion.div>
        ) : (
          <>
            <motion.div
              variants={reduced ? {} : staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-4"
            >
              {displayed.map((review) => (
                <motion.div key={review.id} variants={reduced ? {} : staggerItem}>
                  {review.product && (
                    <div className="mb-2 px-1 flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-brand-500" aria-hidden="true" />
                      <Link
                        href={`/products/${(review.product as any).slug ?? review.product_id}`}
                        className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                      >
                        {(review.product as any).name ?? 'Product'}
                      </Link>
                    </div>
                  )}
                  <ReviewCard
                    review={review}
                    currentUser={user}
                    onDelete={handleDelete}
                    showStatus
                  />
                </motion.div>
              ))}
            </motion.div>

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
