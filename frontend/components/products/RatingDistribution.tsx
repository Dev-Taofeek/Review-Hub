'use client';

import { Star } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { getRatingLabel } from '@/lib/utils';
import type { RatingDistribution } from '@/types';

interface RatingDistributionProps {
  average: number;
  total: number;
  distribution: RatingDistribution;
}

export function RatingDistributionWidget({ average, total, distribution }: RatingDistributionProps) {
  const max = Math.max(...Object.values(distribution), 1);

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      {/* Average score */}
      <div className="flex flex-col items-center justify-center shrink-0 min-w-[100px]">
        <span className="text-data text-5xl font-black text-[var(--foreground)] leading-none">
          {average.toFixed(1)}
        </span>
        <StarRating rating={average} size="md" className="mt-2" />
        <span className="mt-1 text-sm font-bold text-[var(--primary)]">{getRatingLabel(average)}</span>
        <span className="mt-0.5 text-xs text-[var(--muted)]">{total} {total === 1 ? 'review' : 'reviews'}</span>
      </div>

      {/* Bars */}
      <div className="flex-1 w-full flex flex-col gap-1.5">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = distribution[star];
          const pct   = max > 0 ? (count / max) * 100 : 0;
          const reviewPct = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div key={star} className="flex items-center gap-2.5">
              <div className="flex items-center gap-1 w-10 shrink-0">
                <span className="w-3 text-right text-xs font-black text-[var(--muted)]">{star}</span>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
              </div>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-soft)]">
                <div className="h-full rounded-full bg-[var(--secondary)] transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-8 shrink-0 text-right text-data text-xs font-bold text-[var(--muted)]">{reviewPct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
