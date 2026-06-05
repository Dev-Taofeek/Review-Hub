'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Star } from 'lucide-react';
import { cn, formatPrice, buildProductImageUrl } from '@/lib/utils';
import { staggerItem } from '@/lib/animations';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const reduced     = useReducedMotion();
  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const rating      = product.average_rating ?? 0;
  const reviews     = product.total_reviews  ?? 0;

  return (
    <motion.div
      variants={staggerItem}
      whileHover={reduced ? {} : { y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
      className={cn('group', className)}
    >
      <Link href={`/products/${product.slug}`} tabIndex={0} aria-label={`View ${product.name}`}>
        <article className="relative rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#0c1526] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40 transition-shadow duration-300">

          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-50 dark:bg-white/[0.03]">
            <Image
              src={buildProductImageUrl(primaryImage)}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            />

            {/* Category pill */}
            {product.category?.icon && (
              <span className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-[#0c1526]/90 text-sm shadow-sm backdrop-blur-sm border border-black/5 dark:border-white/10">
                {product.category.icon}
              </span>
            )}

            {/* Rating badge overlay — appears on hover */}
            {rating > 0 && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                {rating.toFixed(1)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            {/* Brand + category */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
                {product.brand}
              </span>
              {product.category?.name && (
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400">
                  {product.category.name}
                </span>
              )}
            </div>

            {/* Name */}
            <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-200">
              {product.name}
            </h3>

            {/* Stars + review count */}
            <div className="flex items-center gap-1.5 mb-3">
              {rating > 0 ? (
                <>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          'h-3.5 w-3.5',
                          s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'
                        )}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400">({reviews})</span>
                </>
              ) : (
                <span className="text-xs text-slate-400 italic">No reviews yet</span>
              )}
            </div>

            {/* Price + review count */}
            <div className="flex items-center justify-between">
              <span className="text-base font-black text-slate-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{reviews} review{reviews !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Bottom gradient accent line on hover */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 to-teal-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </article>
      </Link>
    </motion.div>
  );
}
