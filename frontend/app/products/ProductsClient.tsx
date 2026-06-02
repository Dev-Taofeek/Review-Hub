'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Plus } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';

export function ProductsClient() {
  const [page, setPage] = useState(1);
  const { products, total, totalPages, loading, filters, setFilters } = useProducts({ page });
  const { isAuthenticated } = useAuth();

  const isFiltered = !!(filters.search || filters.category || filters.brand || filters.minPrice || filters.maxPrice || filters.minRating);

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-14 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Browse Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Loading…' : total > 0 ? `${total} product${total !== 1 ? 's' : ''} found` : 'No products yet'}
          </p>
        </div>
        {isAuthenticated && (
          <Link href="/products/new">
            <Button icon={<Plus className="h-4 w-4" />} size="sm">
              Add Product
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ProductFilters
          initialFilters={filters}
          onFiltersChange={(f) => { setFilters({ ...f }); setPage(1); }}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        isFiltered ? (
          /* No results for current filters */
          <EmptyState
            icon={<Package />}
            title="No products match your filters"
            description="Try adjusting your search or clearing some filters."
            action={{ label: 'Clear filters', onClick: () => setFilters({ sortBy: 'newest', search: '', category: '', brand: '', minPrice: '', maxPrice: '', minRating: '' }) }}
          />
        ) : (
          /* Completely empty — no products in DB */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-2xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center mb-5">
              <Package className="h-10 w-10 text-brand-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No products yet
            </h2>
            <p className="text-gray-500 max-w-sm mb-6">
              Be the first to add a product you've bought and share your experience with the community.
            </p>
            {isAuthenticated ? (
              <Link href="/products/new">
                <Button size="lg" icon={<Plus className="h-5 w-5" />}>
                  Add the first product
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button size="lg">Sign up to add products</Button>
              </Link>
            )}
          </div>
        )
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="mt-8 flex justify-center">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
