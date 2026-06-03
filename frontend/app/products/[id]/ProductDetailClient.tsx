'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Plus, MessageSquare } from 'lucide-react';
import { useProduct } from '@/hooks/useProducts';
import { useReviews } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReportModal } from '@/components/reviews/ReportModal';
import { RatingDistributionWidget } from '@/components/products/RatingDistribution';
import { formatPrice, buildProductImageUrl } from '@/lib/utils';
import type { Review } from '@/types';

interface Props { slug: string }

export function ProductDetailClient({ slug }: Props) {
  const { product, loading: productLoading } = useProduct(slug);
  const [page, setPage] = useState(1);
  const { reviews, total, totalPages, loading: reviewsLoading, addReview, updateReview, removeReview } = useReviews(product?.id ?? '', page);
  const { user, isAuthenticated } = useAuth();

  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [editingReview,  setEditingReview]  = useState<Review | null>(null);
  const [reportingReview, setReportingReview] = useState<Review | null>(null);

  if (productLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Skeleton className="h-5 w-28 mb-6" />
        <div className="grid lg:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <EmptyState
          title="Product not found"
          description="This product may have been removed or doesn't exist."
          action={{ label: 'Back to Products', onClick: () => history.back() }}
        />
      </div>
    );
  }

  const images = product.images ?? [];
  const currentImage = images[selectedImage]?.url ?? '/placeholder-product.svg';

  return (
    <div className="mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Products
        </Link>
      </nav>

      {/* Product details */}
      <div className="grid gap-6 sm:gap-10 lg:grid-cols-2 mb-8 sm:mb-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/5 mb-3">
            <Image
              src={buildProductImageUrl({ url: currentImage })}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    i === selectedImage ? 'border-brand-500' : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <Image src={img.url} alt={`Product image ${i + 1}`} fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {product.category && <Badge variant="info">{product.category.icon} {product.category.name}</Badge>}
            <span className="text-sm text-slate-500">{product.brand}</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-3">
            <StarRating rating={product.average_rating} size="md" showValue />
            <span className="text-sm text-slate-500">({product.total_reviews} reviews)</span>
          </div>

          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {formatPrice(product.price)}
          </p>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {product.description}
          </p>

          {isAuthenticated ? (
            <Button
              size="lg"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setReviewFormOpen(true)}
              className="mt-2 w-fit"
            >
              Write a Review
            </Button>
          ) : (
            <Link href={`/login?redirectTo=/products/${slug}`}>
              <Button variant="outline" size="lg" className="w-fit">
                Sign in to Write a Review
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Rating Distribution */}
      {product.rating_distribution && product.total_reviews > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card dark:bg-surface-dark-muted dark:border-white/8 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-5">Ratings Overview</h2>
          <RatingDistributionWidget
            average={product.average_rating}
            total={product.total_reviews}
            distribution={product.rating_distribution}
          />
        </div>
      )}

      {/* Reviews */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-slate-400" />
            Reviews ({total})
          </h2>
        </div>

        {reviewsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 dark:bg-surface-dark-muted dark:border-white/8">
                <div className="flex gap-3 mb-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1"><Skeleton className="h-4 w-32 mb-1.5" /><Skeleton className="h-3 w-20" /></div>
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState
            title="No reviews yet"
            description="Be the first to review this product."
            action={isAuthenticated ? { label: 'Write a Review', onClick: () => setReviewFormOpen(true) } : undefined}
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2" role="list">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  currentUser={user}
                  onEdit={(r) => { setEditingReview(r); setReviewFormOpen(true); }}
                  onDelete={removeReview}
                  onReport={setReportingReview}
                />
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* Review form modal */}
      <Modal
        open={reviewFormOpen}
        onClose={() => { setReviewFormOpen(false); setEditingReview(null); }}
        title={editingReview ? 'Edit Review' : 'Write a Review'}
        size="lg"
      >
        <ReviewForm
          productId={product.id}
          existingReview={editingReview ?? undefined}
          onCancel={() => { setReviewFormOpen(false); setEditingReview(null); }}
          onSuccess={(review) => {
            if (editingReview) updateReview(review);
            else addReview(review);
            setReviewFormOpen(false);
            setEditingReview(null);
          }}
        />
      </Modal>

      <ReportModal
        review={reportingReview}
        onClose={() => setReportingReview(null)}
      />
    </div>
  );
}
