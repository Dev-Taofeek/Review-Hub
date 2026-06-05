'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Star, MessageSquare, ArrowUpRight } from 'lucide-react';
import { cn, formatPrice, buildProductImageUrl } from '@/lib/utils';
import { staggerItem } from '@/lib/animations';
import type { Product } from '@/types';

/* Mini trust ring */
function MiniRing({ rating, size = 40 }: { rating: number; size?: number }) {
  const score = Math.round((rating / 5) * 100);
  const R = (size - 6) / 2;
  const C = 2 * Math.PI * R;
  const dash = (score / 100) * C;
  const color = score >= 85 ? '#00E5A0' : score >= 65 ? '#FBBF24' : '#FF6B6B';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
      <circle cx={size/2} cy={size/2} r={R} fill="none" strokeWidth="3" stroke="rgba(255,255,255,0.06)" />
      <circle cx={size/2} cy={size/2} r={R} fill="none" strokeWidth="3"
        stroke={color} strokeLinecap="round"
        strokeDasharray={`${dash} ${C}`}
        style={{ filter: `drop-shadow(0 0 3px ${color}80)` }}
      />
    </svg>
  );
}

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const reduced      = useReducedMotion();
  const primaryImage = product.images?.find(img => img.is_primary) ?? product.images?.[0];
  const rating       = product.average_rating ?? 0;
  const reviews      = product.total_reviews ?? 0;
  const hasRating    = rating > 0;

  /* Sentiment label */
  const sentiment =
    rating >= 4.5 ? { label: 'Exceptional', color: '#00E5A0' } :
    rating >= 4   ? { label: 'Excellent',   color: '#34d399'  } :
    rating >= 3   ? { label: 'Good',         color: '#FBBF24'  } :
    rating >= 2   ? { label: 'Mixed',        color: '#F97316'  } :
                    { label: 'Poor',          color: '#FF6B6B'  };

  return (
    <motion.div
      variants={staggerItem}
      whileHover={reduced ? {} : { y: -6, transition: { duration: 0.22, ease: [0.25,0.46,0.45,0.94] } }}
      className={cn('group', className)}
    >
      <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
        <article className={cn(
          'relative rounded-2xl overflow-hidden h-full flex flex-col',
          'transition-all duration-300',
          /* Light mode */
          'bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.07),0_6px_20px_rgba(0,0,0,0.05)]',
          'hover:border-emerald-200/60 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_0_0_1px_rgba(5,150,105,0.12)]',
          /* Dark mode */
          'dark:border-white/[0.07] dark:bg-[#0D1020]',
          'dark:[box-shadow:0_0_0_1px_rgba(255,255,255,0.03)_inset,0_1px_0_rgba(255,255,255,0.05)_inset,0_8px_24px_rgba(0,0,0,0.4)]',
          'dark:hover:border-[rgba(0,229,160,0.2)]',
          'dark:hover:[box-shadow:0_0_0_1px_rgba(0,229,160,0.08),0_0_0_1px_rgba(255,255,255,0.04)_inset,0_16px_40px_rgba(0,0,0,0.5),0_0_24px_rgba(0,229,160,0.05)]',
        )}>

          {/* ── Image container ─────────────────────────── */}
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-50 dark:bg-white/[0.02] shrink-0">
            <Image
              src={buildProductImageUrl(primaryImage)}
              alt={product.name}
              fill
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
              className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
            />

            {/* Category pill */}
            {product.category?.name && (
              <div className="absolute top-3 left-3 text-label-mono px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(0,0,0,0.55)',
                  backdropFilter: 'blur(12px)',
                  color: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                {product.category.icon && <span className="mr-1" aria-hidden="true">{product.category.icon}</span>}
                {product.category.name}
              </div>
            )}

            {/* Open indicator */}
            <div className="absolute top-3 right-3 h-8 w-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}>
              <ArrowUpRight className="h-4 w-4 text-white" aria-hidden="true" />
            </div>

            {/* Bottom rating ring overlay on hover */}
            {hasRating && (
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center">
                <MiniRing rating={rating} size={36} />
              </div>
            )}

            {/* Gradient fade at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent dark:from-black/40" />
          </div>

          {/* ── Info ────────────────────────────────────── */}
          <div className="flex flex-col flex-1 p-4 gap-2">
            {/* Brand */}
            <p className="text-label-mono" style={{ color: 'var(--text-3)' }}>{product.brand}</p>

            {/* Name */}
            <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug
                           group-hover:text-emerald-700 dark:group-hover:text-[#00E5A0] transition-colors duration-200">
              {product.name}
            </h3>

            {/* Rating + sentiment */}
            <div className="flex items-center gap-2">
              {hasRating ? (
                <>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={cn('h-3 w-3',
                        s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 dark:fill-white/10 text-transparent dark:text-transparent'
                      )} />
                    ))}
                  </div>
                  <span className="text-data text-xs font-bold text-slate-700 dark:text-white">{rating.toFixed(1)}</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                    style={{ background: `${sentiment.color}18`, color: sentiment.color, fontSize: '10px' }}>
                    {sentiment.label}
                  </span>
                </>
              ) : (
                <span className="text-xs italic" style={{ color: 'var(--text-3)' }}>No reviews yet</span>
              )}
            </div>

            {/* Price + review count */}
            <div className="flex items-center justify-between mt-auto pt-3"
              style={{ borderTop: '1px solid var(--line)' }}>
              <span className="text-data text-base font-black text-slate-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              {reviews > 0 && (
                <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-3)' }}>
                  <MessageSquare className="h-3 w-3" aria-hidden="true" />
                  {reviews}
                </span>
              )}
            </div>
          </div>

          {/* Bottom signal line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
            style={{ background: `linear-gradient(90deg, ${hasRating ? sentiment.color : 'var(--signal)'}, transparent)` }}
          />
        </article>
      </Link>
    </motion.div>
  );
}
