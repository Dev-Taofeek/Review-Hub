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
    <div className="flex flex-col sm:flex-row gap-6 items-start">
      {/* Average score */}
      <div className="flex flex-col items-center justify-center shrink-0 min-w-[100px]">
        <span className="text-5xl font-bold text-slate-900 dark:text-white leading-none">
          {average.toFixed(1)}
        </span>
        <StarRating rating={average} size="md" className="mt-2" />
        <span className="mt-1 text-sm text-slate-500">{getRatingLabel(average)}</span>
        <span className="text-xs text-slate-400 mt-0.5">{total} {total === 1 ? 'review' : 'reviews'}</span>
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
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 w-3 text-right">{star}</span>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
              </div>
              <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 w-8 text-right shrink-0">{reviewPct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
