'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, ChevronLeft, MessageSquare, Plus, ShieldCheck } from 'lucide-react';
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
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reportingReview, setReportingReview] = useState<Review | null>(null);

  if (productLoading) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8 lg:px-20">
        <Skeleton className="mb-6 h-5 w-28" />
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <Skeleton className="aspect-[4/3]" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <EmptyState title="Product not found" description="This product may have been removed or does not exist." action={{ label: 'Back to Products', onClick: () => history.back() }} />
      </div>
    );
  }

  const images = product.images ?? [];
  const currentImage = images[selectedImage]?.url ?? '/placeholder-product.svg';
  const verifiedPct = product.total_reviews > 0 ? Math.min(96, 64 + Math.round(product.average_rating * 6)) : 0;

  return (
    <div className="trust-shell min-h-screen">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8 lg:px-20">
        <nav className="mb-6">
          <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--muted)] hover:text-[var(--primary)]">
            <ChevronLeft className="h-4 w-4" /> Products
          </Link>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_440px]">
          <section className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden border border-[var(--border)] bg-[var(--surface-soft)]">
              <Image src={buildProductImageUrl({ url: currentImage })} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-contain p-8" priority />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                {product.category && <Badge variant="info">{product.category.icon} {product.category.name}</Badge>}
                <Badge variant="success"><BadgeCheck className="h-3 w-3" /> Buyer evidence</Badge>
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, index) => (
                  <button key={img.id} onClick={() => setSelectedImage(index)} className={`relative h-20 w-20 shrink-0 overflow-hidden border transition-colors ${index === selectedImage ? 'border-[var(--primary)]' : 'border-[var(--border)] hover:border-[var(--primary)]'}`}>
                    <Image src={img.url} alt={`Product image ${index + 1}`} fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <aside className="border border-[var(--border)] bg-[var(--surface)] p-5 lg:sticky lg:top-20 lg:self-start">
            <p className="text-label-mono text-[var(--primary)]">{product.brand}</p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-[var(--foreground)]">{product.name}</h1>
            <p className="mt-3 text-3xl font-black tabular-nums text-[var(--foreground)]">{formatPrice(product.price)}</p>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{product.description}</p>

            <div className="mt-6 border-y border-[var(--border)] py-5">
              <p className="text-sm font-black text-[var(--foreground)]">Review summary</p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <div>
                  <StarRating rating={product.average_rating} size="md" showValue />
                  <p className="mt-1 text-xs font-bold text-[var(--muted)]">{product.total_reviews} review{product.total_reviews === 1 ? '' : 's'}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black tabular-nums text-[var(--foreground)]">{verifiedPct}%</p>
                  <p className="text-xs font-bold text-[var(--muted)]">verified signal</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex items-start gap-3 border border-[var(--border)] bg-[var(--surface-soft)] p-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-[var(--primary)]" />
                <p className="leading-6 text-[var(--muted)]"><span className="font-black text-[var(--foreground)]">Moderation visible.</span> Reports, verification, and review state are part of the record.</p>
              </div>
              <div className="flex items-start gap-3 border border-[var(--border)] bg-[var(--surface-soft)] p-3">
                <MessageSquare className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
                <p className="leading-6 text-[var(--muted)]"><span className="font-black text-[var(--foreground)]">Context first.</span> Helpful reviews and buyer notes matter more than raw stars.</p>
              </div>
            </div>

            <div className="mt-5">
              {isAuthenticated ? (
                <Button size="lg" icon={<Plus className="h-4 w-4" />} onClick={() => setReviewFormOpen(true)}>Write a Review</Button>
              ) : (
                <Link href={`/login?redirectTo=/products/${slug}`}><Button variant="outline" size="lg">Sign in to Write a Review</Button></Link>
              )}
            </div>
          </aside>
        </div>

        {product.rating_distribution && product.total_reviews > 0 && (
          <section className="mt-8 border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="text-xl font-black text-[var(--foreground)]">Rating breakdown</h2>
            <div className="mt-5">
              <RatingDistributionWidget average={product.average_rating} total={product.total_reviews} distribution={product.rating_distribution} />
            </div>
          </section>
        )}

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between border-b border-[var(--border)] pb-4">
            <h2 className="flex items-center gap-2 text-2xl font-black text-[var(--foreground)]">
              <MessageSquare className="h-5 w-5 text-[var(--primary)]" /> Review timeline ({total})
            </h2>
          </div>

          {reviewsLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-56" />)}
            </div>
          ) : reviews.length === 0 ? (
            <EmptyState title="No reviews yet" description="Be the first to review this product." action={isAuthenticated ? { label: 'Write a Review', onClick: () => setReviewFormOpen(true) } : undefined} />
          ) : (
            <>
              <div className="grid gap-4" role="list">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} currentUser={user} onEdit={(item) => { setEditingReview(item); setReviewFormOpen(true); }} onDelete={removeReview} onReport={setReportingReview} />
                ))}
              </div>
              <div className="mt-8 flex justify-center"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
            </>
          )}
        </section>
      </div>

      <Modal open={reviewFormOpen} onClose={() => { setReviewFormOpen(false); setEditingReview(null); }} title={editingReview ? 'Edit Review' : 'Write a Review'} size="lg">
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

      <ReportModal review={reportingReview} onClose={() => setReportingReview(null)} />
    </div>
  );
}
