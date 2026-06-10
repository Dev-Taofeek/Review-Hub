'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, Package, Plus, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';

export function ProductsClient() {
  const [page, setPage] = useState(1);
  const [selectedDiscoveryTag, setSelectedDiscoveryTag] = useState('Verified picks');
  const { products, total, totalPages, loading, filters, setFilters } = useProducts({ page });
  const { isAuthenticated } = useAuth();
  const isFiltered = !!(filters.search || filters.category || filters.brand || filters.minPrice || filters.maxPrice || filters.minRating);

  const filterPanel = (
    <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-4 flex items-center gap-2 border-b border-[var(--border)] pb-3 text-sm font-black text-[var(--foreground)]">
        <SlidersHorizontal className="h-4 w-4 text-[var(--primary)]" />
        Discovery filters
      </div>
      <ProductFilters initialFilters={filters} onFiltersChange={(f) => { setFilters({ ...f }); setPage(1); }} />
      <div className="mt-5 border border-[var(--border)] bg-[var(--surface-soft)] p-4">
        <div className="flex items-center gap-2 text-xs font-black text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" /> Trust layer active
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Cards prioritize verified reviews, rating quality, and moderation confidence.</p>
      </div>
    </div>
  );

  return (
    <div className="trust-shell min-h-screen">
      <div className="mx-auto max-w-[1600px] px-4 py-8 xs:px-5 sm:px-8 lg:px-20">
        <div className="mb-6 grid gap-5 border-b border-[var(--border)] pb-7 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-2 text-label-mono text-[var(--primary)]">Product discovery</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-[var(--foreground)] xs:text-5xl">Find products with reviews you can actually trust.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]" aria-live="polite">
              {loading ? 'Loading...' : total > 0 ? `${total} product${total !== 1 ? 's' : ''} found` : 'No products yet'}
            </p>
          </div>
          {isAuthenticated && (
            <Link href="/products/new" className="self-start">
              <Button icon={<Plus className="h-4 w-4" aria-hidden="true" />} size="sm">Add Product</Button>
            </Link>
          )}
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {['Verified picks', 'High confidence', 'Most reviewed', 'New arrivals', 'Buyer favorites'].map((chip) => (
            <button
              key={chip}
              type="button"
              aria-pressed={selectedDiscoveryTag === chip}
              onClick={() => setSelectedDiscoveryTag(chip)}
              className={`shrink-0 border px-4 py-2 text-xs font-extrabold transition ${
                selectedDiscoveryTag === chip
                  ? 'border-[var(--primary)] bg-[var(--primary)] text-white '
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
              }`}
            >
              {selectedDiscoveryTag === chip && <BadgeCheck className="mr-1 inline h-3.5 w-3.5" />}
              {chip}
            </button>
          ))}
        </div>

        {loading ? (
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <div className="hidden lg:block">{filterPanel}</div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            </div>
          ) : products.length === 0 ? (
              <div className="trust-card flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center border border-[var(--border)] bg-[var(--surface-soft)]">
                  {isFiltered ? <Search className="h-10 w-10 text-[var(--primary)]" /> : <Package className="h-10 w-10 text-[var(--primary)]" />}
                </div>
                <h2 className="mb-2 text-xl font-black text-[var(--foreground)]">{isFiltered ? 'No products match your filters' : 'No products yet'}</h2>
                <p className="mb-8 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
                  {isFiltered ? 'Try adjusting your search terms or clearing some filters.' : "Be the first to add a product you've bought and share your experience with the community."}
                </p>
                {isFiltered ? (
                  <Button variant="outline" onClick={() => setFilters({ sortBy: 'newest', search: '', category: '', brand: '', minPrice: '', maxPrice: '', minRating: '' })}>Clear all filters</Button>
                ) : isAuthenticated ? (
                  <Link href="/products/new"><Button size="lg" icon={<Plus className="h-5 w-5" />}>Add the first product</Button></Link>
                ) : (
                  <Link href="/register"><Button size="lg">Sign up to add products</Button></Link>
                )}
              </div>
          ) : (
            <div>
              <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                <aside className="hidden lg:block"><div className="sticky top-20">{filterPanel}</div></aside>
                <div>
                  <div className="mb-5 lg:hidden">{filterPanel}</div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((p) => <ProductCard key={p.id} product={p} />)}
                  </div>
                </div>
              </div>
              {totalPages > 1 && (
                <div className="mt-10 flex justify-center">
                  <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
