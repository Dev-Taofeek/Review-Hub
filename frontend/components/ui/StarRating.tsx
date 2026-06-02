'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
  showValue?: boolean;
}

const sizes = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function StarRating({
  rating,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
  showValue = false,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const effective = hovered || rating;

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }, (_, i) => {
        const value   = i + 1;
        const filled  = value <= effective;
        const partial = !filled && value - 0.5 <= effective;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(value)}
            onMouseEnter={() => interactive && setHovered(value)}
            onMouseLeave={() => interactive && setHovered(0)}
            className={cn(
              'relative',
              interactive && 'cursor-pointer transition-transform hover:scale-110 active:scale-95',
              !interactive && 'cursor-default'
            )}
          >
            {/* Background star */}
            <Star
              className={cn(sizes[size], 'text-slate-200 dark:text-slate-700')}
              fill="currentColor"
            />
            {/* Filled star (full or half) */}
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: filled ? '100%' : partial ? '50%' : '0%' }}
            >
              <Star
                className={cn(
                  sizes[size],
                  'text-amber-400',
                  hovered && interactive && 'text-amber-500'
                )}
                fill="currentColor"
              />
            </span>
          </button>
        );
      })}
      {showValue && (
        <span className="ml-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
