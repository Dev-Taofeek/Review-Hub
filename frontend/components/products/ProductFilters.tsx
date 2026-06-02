'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCategories } from '@/hooks/useProducts';

interface FiltersState {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  sortBy: string;
}

interface ProductFiltersProps {
  initialFilters?: Partial<FiltersState>;
  onFiltersChange: (filters: FiltersState) => void;
}

const SORT_OPTIONS = [
  { value: 'newest',       label: 'Newest first'    },
  { value: 'rating_desc',  label: 'Highest rated'   },
  { value: 'most_reviewed',label: 'Most reviewed'   },
  { value: 'price_asc',    label: 'Price: Low → High'},
  { value: 'price_desc',   label: 'Price: High → Low'},
];

const RATING_OPTIONS = [
  { value: '',    label: 'Any rating'  },
  { value: '4.5', label: '4.5+ ⭐⭐⭐⭐½' },
  { value: '4',   label: '4.0+ ⭐⭐⭐⭐'   },
  { value: '3',   label: '3.0+ ⭐⭐⭐'     },
];

export function ProductFilters({ initialFilters = {}, onFiltersChange }: ProductFiltersProps) {
  const { categories } = useCategories();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    search:    '',
    category:  '',
    minPrice:  '',
    maxPrice:  '',
    minRating: '',
    sortBy:    'newest',
    ...initialFilters,
  });

  const update = (key: keyof FiltersState, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFiltersChange(next);
  };

  const reset = () => {
    const cleared: FiltersState = { search: '', category: '', minPrice: '', maxPrice: '', minRating: '', sortBy: 'newest' };
    setFilters(cleared);
    onFiltersChange(cleared);
  };

  const hasActive = filters.category || filters.minPrice || filters.maxPrice || filters.minRating;

  return (
    <div className="flex flex-col gap-3">
      {/* Search + sort row */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search products…"
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <Select
          options={SORT_OPTIONS}
          value={filters.sortBy}
          onChange={(e) => update('sortBy', e.target.value)}
          className="w-44 shrink-0"
        />
        <Button
          variant={showAdvanced ? 'primary' : 'outline'}
          size="md"
          icon={<SlidersHorizontal className="h-4 w-4" />}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="shrink-0"
        >
          Filters
          {hasActive && (
            <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px]">!</span>
          )}
        </Button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-soft dark:bg-surface-dark-muted dark:border-white/8 animate-slide-down">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Select
              label="Category"
              options={[{ value: '', label: 'All categories' }, ...categories.map((c) => ({ value: c.slug, label: c.name }))]}
              value={filters.category}
              onChange={(e) => update('category', e.target.value)}
            />
            <Select
              label="Min Rating"
              options={RATING_OPTIONS}
              value={filters.minRating}
              onChange={(e) => update('minRating', e.target.value)}
            />
            <Input
              label="Min Price ($)"
              type="number"
              min="0"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => update('minPrice', e.target.value)}
            />
            <Input
              label="Max Price ($)"
              type="number"
              min="0"
              placeholder="Any"
              value={filters.maxPrice}
              onChange={(e) => update('maxPrice', e.target.value)}
            />
          </div>
          {hasActive && (
            <div className="mt-3 flex justify-end">
              <Button variant="ghost" size="sm" icon={<X className="h-3.5 w-3.5" />} onClick={reset}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
