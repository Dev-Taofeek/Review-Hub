'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted)] transition-colors',
          'hover:bg-[var(--surface-soft)] disabled:opacity-40 disabled:pointer-events-none'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="flex h-9 w-9 items-center justify-center text-[var(--muted)] text-sm">
            ···
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors',
              p === page
                ? 'bg-brand-600 text-white shadow-brand-sm'
                : 'text-[var(--muted)] hover:bg-[var(--surface-soft)]'
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted)] transition-colors',
          'hover:bg-[var(--surface-soft)] disabled:opacity-40 disabled:pointer-events-none'
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
