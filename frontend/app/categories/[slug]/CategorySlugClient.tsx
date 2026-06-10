'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, Package, Plus, SlidersHorizontal } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { useAuth } from '@/hooks/useAuth';
import type { Category, Product } from '@/types';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'rating_desc', label: 'Top Rated' },
  { value: 'most_reviewed', label: 'Most Reviewed' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

interface Props { slug: string }

export function CategorySlugClient({ slug }: Props) {
  const { isAuthenticated } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    productsApi.getCategories().then((res) => {
      const found = (res.data ?? []).find((c) => c.slug === slug) ?? null;
      setCategory(found);
      setCatLoading(false);
    });
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    productsApi.getByCategory(slug, { sortBy, page, limit: 16 })
      .then((res) => {
        setProducts(res.data ?? []);
        setTotal(res.pagination?.total ?? 0);
        setTotalPages(res.pagination?.totalPages ?? 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, sortBy, page]);

  const handleSort = (value: string) => { setSortBy(value); setPage(1); };

  return (
    <div className="trust-shell min-h-screen">
      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-[1600px] px-4 py-10 xs:px-5 sm:px-8 lg:px-20">
          <Link href="/categories" className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--muted)] transition hover:text-[var(--primary)]">
            <ChevronLeft className="h-4 w-4" /> All Categories
          </Link>

          {catLoading ? (
            <div className="space-y-3" aria-label="Loading category" aria-busy="true">
              <div className="h-8 w-16 rounded-xl bg-[var(--surface-soft)]" />
              <div className="h-10 w-64 rounded-xl bg-[var(--surface-soft)]" />
              <div className="h-4 w-48 rounded-lg bg-[var(--surface-soft)]" />
            </div>
          ) : category ? (
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--primary-soft)] text-3xl text-[var(--primary)] sm:h-20 sm:w-20 sm:text-4xl">
                {category.icon || 'Box'}
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">{category.name}</h1>
                {category.description && <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--muted)] sm:text-base">{category.description}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--primary-soft)] px-3 py-1 text-xs font-black text-[var(--primary)]">
                    <Package className="h-3 w-3" />
                    {total} product{total !== 1 ? 's' : ''}
                  </span>
                  <Link href="/products" className="flex items-center gap-1 text-xs font-bold text-[var(--muted)] transition hover:text-[var(--primary)]">
                    Browse all products <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xl font-black text-[var(--foreground)]">Category not found</p>
              <Link href="/categories" className="mt-2 inline-block text-sm font-bold text-[var(--primary)]">Back to categories</Link>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-4 py-8 xs:px-5 sm:px-8 lg:px-20">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-bold text-[var(--muted)]" aria-live="polite">
            {loading ? 'Loading products...' : `${total} product${total !== 1 ? 's' : ''} in ${category?.name ?? 'this category'}`}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 ">
              <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" />
              <label htmlFor="category-sort" className="sr-only">Sort products</label>
              <select id="category-sort" value={sortBy} onChange={(e) => handleSort(e.target.value)} className="cursor-pointer border-none bg-transparent text-sm font-bold text-[var(--foreground)] outline-none">
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {isAuthenticated && (
              <Link href="/products/new">
                <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />}>Add Product</Button>
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading products" aria-busy="true">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="trust-card rounded-lg py-20 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-lg bg-[var(--primary-soft)]">
              <Package className="h-10 w-10 text-[var(--primary)]" />
            </div>
            <p className="mb-2 text-lg font-black text-[var(--foreground)]">No products in this category yet</p>
            <p className="mx-auto mb-6 max-w-xs text-sm text-[var(--muted)]">Be the first to add a product to {category?.name ?? 'this category'}.</p>
            {isAuthenticated
              ? <Link href="/products/new"><Button size="sm" icon={<Plus className="h-4 w-4" />}>Add a Product</Button></Link>
              : <Link href="/register"><Button size="sm">Sign up to add products</Button></Link>}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
