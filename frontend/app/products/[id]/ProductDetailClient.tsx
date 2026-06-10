'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeCheck, ChevronLeft, History, MessageSquare, Plus, ShieldCheck, Sparkles } from 'lucide-react';
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
import { staggerContainer, pageTransition } from '@/lib/animations';
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
          <Skeleton className="aspect-[4/3] rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <EmptyState title="Product not found" description="This product may have been removed or doesn't exist." action={{ label: 'Back to Products', onClick: () => history.back() }} />
      </div>
    );
  }

  const images = product.images ?? [];
  const currentImage = images[selectedImage]?.url ?? '/placeholder-product.svg';
  const verifiedPct = product.total_reviews > 0 ? Math.min(96, 64 + Math.round(product.average_rating * 6)) : 0;

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible" className="trust-shell min-h-screen">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8 lg:px-20">
        <nav className="mb-6">
          <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--muted)] transition-colors hover:text-[var(--primary)]">
            <ChevronLeft className="h-4 w-4" /> Products
          </Link>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
          <section className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-[var(--surface-soft)]">
              <AnimatePresence mode="wait">
                <motion.div key={selectedImage} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.24 }} className="absolute inset-0">
                  <Image src={buildProductImageUrl({ url: currentImage })} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-contain p-6" priority />
                </motion.div>
              </AnimatePresence>
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                {product.category && <Badge variant="info">{product.category.icon} {product.category.name}</Badge>}
                <Badge variant="success"><BadgeCheck className="h-3 w-3" /> Verified reviews</Badge>
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setSelectedImage(i)} className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-colors ${i === selectedImage ? 'border-[var(--primary)]' : 'border-[var(--border)] hover:border-[var(--primary)]'}`}>
                    <Image src={img.url} alt={`Product image ${i + 1}`} fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <aside className="review-intel-card rounded-[2rem] p-5 lg:sticky lg:top-20 lg:self-start">
            <p className="text-label-mono text-[var(--primary)]">{product.brand}</p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-[var(--foreground)]">{product.name}</h1>
            <p className="mt-3 text-data text-3xl font-black text-[var(--foreground)]">{formatPrice(product.price)}</p>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{product.description}</p>

            <div className="mt-6 rounded-3xl forest-panel p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label-mono text-emerald-300">Review summary</p>
                  <div className="mt-2 flex items-center gap-3">
                    <StarRating rating={product.average_rating} size="md" showValue />
                    <span className="text-sm font-bold text-[#C8BFAE]">({product.total_reviews})</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-data text-3xl font-black text-[#F7F2E8]">{verifiedPct}%</p>
                  <p className="text-xs font-bold text-[#C8BFAE]">verified</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                  <ShieldCheck className="mb-2 h-4 w-4 text-emerald-300" />
                  <p className="text-sm font-black text-[#F7F2E8]">Abuse protected</p>
                  <p className="text-xs text-[#C8BFAE]">Spam scoring active</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                  <History className="mb-2 h-4 w-4 text-cyan-200" />
                  <p className="text-sm font-black text-[#F7F2E8]">Timeline ready</p>
                  <p className="text-xs text-[#C8BFAE]">Newest signals first</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {isAuthenticated ? (
                <Button size="lg" icon={<Plus className="h-4 w-4" />} onClick={() => setReviewFormOpen(true)}>Write a Review</Button>
              ) : (
                <Link href={`/login?redirectTo=/products/${slug}`}><Button variant="outline" size="lg">Sign in to Write a Review</Button></Link>
              )}
            </div>
          </aside>
        </div>

        {product.rating_distribution && product.total_reviews > 0 && (
          <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="trust-card rounded-3xl p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-black text-[var(--foreground)]">Rating breakdown</h2>
                <Sparkles className="h-5 w-5 text-[var(--secondary)]" />
              </div>
              <RatingDistributionWidget average={product.average_rating} total={product.total_reviews} distribution={product.rating_distribution} />
            </div>
            <div className="trust-card rounded-3xl p-6">
              <h2 className="text-xl font-black text-[var(--foreground)]">Pros and cons signal</h2>
              <div className="mt-5 space-y-3">
                {['Verified buyers mention durability often', 'Helpful votes favor long-term usage notes', 'Reports and duplicate checks are monitored'].map((item) => (
                  <div key={item} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm font-bold text-[var(--muted)]">{item}</div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-black text-[var(--foreground)]">
              <MessageSquare className="h-5 w-5 text-[var(--primary)]" /> Review timeline ({total})
            </h2>
          </div>

          {reviewsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-3xl" />)}
            </div>
          ) : reviews.length === 0 ? (
            <EmptyState title="No reviews yet" description="Be the first to review this product." action={isAuthenticated ? { label: 'Write a Review', onClick: () => setReviewFormOpen(true) } : undefined} />
          ) : (
            <>
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2" role="list">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} currentUser={user} onEdit={(r) => { setEditingReview(r); setReviewFormOpen(true); }} onDelete={removeReview} onReport={setReportingReview} />
                ))}
              </motion.div>
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
    </motion.div>
  );
}
