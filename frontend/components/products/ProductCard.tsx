'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import {
  motion, useReducedMotion,
  useMotionValue, useTransform, useSpring,
} from 'framer-motion';
import { BadgeCheck, ShieldCheck, Star, MessageSquare, ArrowUpRight } from 'lucide-react';
import { cn, formatPrice, buildProductImageUrl } from '@/lib/utils';
import { staggerItem } from '@/lib/animations';
import type { Product } from '@/types';

/* ── Mini trust ring ─────────────────────────────────── */
function MiniRing({ rating, size = 36 }: { rating: number; size?: number }) {
  const score = Math.round((rating / 5) * 100);
  const R = (size - 6) / 2;
  const C = 2 * Math.PI * R;
  const dash = (score / 100) * C;
  const color = score >= 85 ? '#00E5A0' : score >= 65 ? '#FBBF24' : '#FF6B6B';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
      <circle cx={size/2} cy={size/2} r={R} fill="none" strokeWidth="3" stroke="rgba(255,255,255,0.12)" />
      <circle cx={size/2} cy={size/2} r={R} fill="none" strokeWidth="3"
        stroke={color} strokeLinecap="round"
        strokeDasharray={`${dash} ${C}`}
        style={{ filter: `drop-shadow(0 0 4px ${color}90)` }}
      />
    </svg>
  );
}

/* ── Sentiment ───────────────────────────────────────── */
const getSentiment = (r: number) =>
  r >= 4.5 ? { label: 'Exceptional', color: '#00E5A0' } :
  r >= 4   ? { label: 'Excellent',   color: '#34d399'  } :
  r >= 3   ? { label: 'Good',        color: '#FBBF24'  } :
  r >= 2   ? { label: 'Mixed',       color: '#F97316'  } :
             { label: 'Poor',         color: '#FF6B6B'  };

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const reduced      = useReducedMotion();
  const cardRef      = useRef<HTMLDivElement>(null);
  const primaryImage = product.images?.find(img => img.is_primary) ?? product.images?.[0];
  const rating       = product.average_rating ?? 0;
  const reviews      = product.total_reviews  ?? 0;
  const hasRating    = rating > 0;
  const sentiment    = getSentiment(rating);

  /* ── 3D tilt values ────────────────────────────────── */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], reduced ? ['0deg','0deg'] : ['7deg','-7deg']);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], reduced ? ['0deg','0deg'] : ['-7deg','7deg']);
  const gloss   = useTransform(mouseX, [-0.5, 0.5], ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.13)']);
  const springX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width  - 0.5);
    mouseY.set((e.clientY - rect.top)  / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      variants={staggerItem}
      className={cn('group', className)}
      style={{ perspective: '1000px' }}
    >
      <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d' }}
          whileHover={reduced ? {} : { y: -6, scale: 1.015 }}
          whileTap={reduced ? {} : { scale: 0.985 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className={cn(
            'relative rounded-3xl overflow-hidden h-full flex flex-col cursor-pointer trust-card trust-card-hover',
            'transition-shadow duration-300',
          )}
        >
          {/* Gloss sheen on tilt */}
          {!reduced && (
            <motion.div
              className="absolute inset-0 pointer-events-none z-10 rounded-2xl"
              style={{ background: gloss }}
            />
          )}

          {/* ── Image ─────────────────────────────────── */}
          <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-soft)] shrink-0">
            <motion.div
              className="absolute inset-0"
              whileHover={reduced ? {} : { scale: 1.06 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Image
                src={buildProductImageUrl(primaryImage)}
                alt={product.name}
                fill
                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                className="object-contain p-5"
              />
            </motion.div>

            <div className="absolute inset-x-4 bottom-3 z-10 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-[#031A14]/70 px-2.5 py-1 text-[10px] font-black text-[#F7F2E8] backdrop-blur">
                <BadgeCheck className="h-3 w-3 text-emerald-300" /> Verified buyers
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-[#031A14]/70 px-2.5 py-1 text-[10px] font-black text-cyan-100 backdrop-blur">
                <ShieldCheck className="h-3 w-3 text-cyan-200" /> Quality {hasRating ? Math.round(rating * 18) : 82}
              </span>
            </div>

            {/* Category pill */}
            {product.category?.name && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="absolute top-3 left-3 text-label-mono px-2.5 py-1 rounded-full z-10"
                style={{
                  background: 'rgba(3,26,20,0.72)',
                  backdropFilter: 'blur(12px)',
                  color: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                {product.category.icon && <span className="mr-1" aria-hidden="true">{product.category.icon}</span>}
                {product.category.name}
              </motion.div>
            )}

            {/* Arrow on hover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="absolute top-3 right-3 h-8 w-8 rounded-lg flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)' }}
            >
              <ArrowUpRight className="h-4 w-4 text-white" aria-hidden="true" />
            </motion.div>

            {/* Rating ring on hover */}
            {hasRating && (
              <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <MiniRing rating={rating} />
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 h-16 bg-[#031A14]/20" />
          </div>

          {/* ── Info ──────────────────────────────────── */}
          <div className="flex flex-col flex-1 p-4 gap-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-label-mono" style={{ color: 'var(--text-3)' }}>{product.brand}</p>
              {hasRating && <span className="rounded-full bg-[var(--secondary-soft)] px-2 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-300">{sentiment.label}</span>}
            </div>

            <h3 className="text-base font-black text-[var(--foreground)] line-clamp-2 leading-snug group-hover:text-[var(--primary)] transition-colors duration-200">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2">
              {hasRating ? (
                <>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={cn('h-3 w-3',
                        s <= Math.round(rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-[var(--border)] text-transparent'
                      )} />
                    ))}
                  </div>
                  <span className="text-data text-xs font-black text-[var(--foreground)]">{rating.toFixed(1)}</span>
                </>
              ) : (
                <span className="text-xs italic" style={{ color: 'var(--text-3)' }}>No reviews yet</span>
              )}
            </div>

            {/* Price + count */}
            {hasRating && (
              <div className="space-y-1.5">
                {[rating * 18, Math.max(14, reviews * 7), 76].map((pct, i) => (
                  <div key={i} className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-soft)]">
                    <div className={cn('h-full rounded-full', i === 0 ? 'bg-[var(--secondary)]' : i === 1 ? 'bg-[var(--primary)]' : 'bg-[var(--accent)]')} style={{ width: `${Math.min(96, pct)}%` }} />
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border)]">
              <span className="text-data text-base font-black text-[var(--foreground)]">
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

          {/* Signal bottom accent */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[2px]"
            initial={{ scaleX: 0 }}
            whileHover={reduced ? {} : { scaleX: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              background: hasRating ? sentiment.color : 'var(--primary)',
              transformOrigin: 'left',
            }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}
