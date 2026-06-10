'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BadgeCheck, MessageSquare, Star } from 'lucide-react';
import { cn, formatPrice, buildProductImageUrl } from '@/lib/utils';
import type { Product } from '@/types';

function ratingLabel(rating: number) {
  if (rating >= 4.6) return 'Strong buy signal';
  if (rating >= 4) return 'Well reviewed';
  if (rating >= 3) return 'Mixed but useful';
  if (rating > 0) return 'Low confidence';
  return 'Awaiting reviews';
}

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const rating = product.average_rating ?? 0;
  const reviews = product.total_reviews ?? 0;
  const hasRating = rating > 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      aria-label={`View ${product.name}`}
      className={cn(
        'group block h-full border border-[var(--border)] bg-[var(--surface)] transition-colors hover:border-[var(--primary)]',
        className
      )}
    >
      <article className="grid h-full grid-rows-[auto_1fr]">
        <div className="relative aspect-[4/3] border-b border-[var(--border)] bg-[var(--surface-soft)]">
          <Image
            src={buildProductImageUrl(primaryImage)}
            alt={product.name}
            fill
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            className="object-contain p-6"
          />
          {product.category?.name && (
            <div className="absolute left-3 top-3 border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">
              {product.category.name}
            </div>
          )}
        </div>

        <div className="flex flex-col p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">
                {product.brand || 'Independent listing'}
              </p>
              <h3 className="mt-1 line-clamp-2 text-base font-black leading-snug text-[var(--foreground)] group-hover:text-[var(--primary)]">
                {product.name}
              </h3>
            </div>
            <p className="shrink-0 text-right text-base font-black tabular-nums text-[var(--foreground)]">
              {formatPrice(product.price)}
            </p>
          </div>

          <div className="mt-auto border-t border-[var(--border)] pt-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-3.5 w-3.5',
                        star <= Math.round(rating)
                          ? 'fill-[var(--secondary)] text-[var(--secondary)]'
                          : 'fill-[var(--border)] text-[var(--border)]'
                      )}
                    />
                  ))}
                  <span className="ml-1 text-sm font-black tabular-nums text-[var(--foreground)]">
                    {hasRating ? rating.toFixed(1) : '0.0'}
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold text-[var(--muted)]">{ratingLabel(rating)}</p>
              </div>
              <div className="text-right">
                <p className="flex items-center justify-end gap-1 text-xs font-bold text-[var(--muted)]">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {reviews} review{reviews === 1 ? '' : 's'}
                </p>
                <p className="mt-1 flex items-center justify-end gap-1 text-[11px] font-extrabold text-[var(--primary)]">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Buyer evidence
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
