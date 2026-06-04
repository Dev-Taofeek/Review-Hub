'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, Package, Plus, ArrowRight, SlidersHorizontal,
} from 'lucide-react';
import { productsApi } from '@/lib/api';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { useAuth } from '@/hooks/useAuth';
import type { Category, Product } from '@/types';

const SORT_OPTIONS = [
  { value: 'newest',        label: 'Newest' },
  { value: 'rating_desc',   label: 'Top Rated' },
  { value: 'most_reviewed', label: 'Most Reviewed' },
  { value: 'price_asc',     label: 'Price: Low → High' },
  { value: 'price_desc',    label: 'Price: High → Low' },
];

interface Props { slug: string }

export function CategorySlugClient({ slug }: Props) {
  const { isAuthenticated } = useAuth();

  const [category,   setCategory]   = useState<Category | null>(null);
  const [products,   setProducts]   = useState<Product[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(1);
  const [sortBy,     setSortBy]     = useState('newest');
  const [loading,    setLoading]    = useState(true);
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#060c1a]">

      {/* Hero */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #020817 0%, #061529 40%, #09233d 100%)' }}>
        <div className="absolute -top-24 right-0 w-[500px] h-[400px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(ellipse, rgba(5,150,105,0.15) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 hero-grid-overlay" />

        <div className="relative mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18 py-10 sm:py-14">
          <Link href="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-brand-400 transition-colors mb-6 group">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
            All Categories
          </Link>

          {catLoading ? (
            <div className="space-y-3" aria-label="Loading category" aria-busy="true">
              <div className="h-8 w-16 rounded-xl bg-white/10 animate-pulse" />
              <div className="h-10 w-64 rounded-xl bg-white/10 animate-pulse" />
              <div className="h-4 w-48 rounded-lg bg-white/10 animate-pulse" />
            </div>
          ) : category ? (
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-3xl sm:text-4xl shadow-xl shrink-0"
                aria-hidden="true">
                {category.icon || '📦'}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-slate-400 text-sm sm:text-base mt-1.5 max-w-lg">{category.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-400 bg-brand-950/60 border border-brand-800/40 px-3 py-1 rounded-full">
                    <Package className="h-3 w-3" aria-hidden="true" />
                    {total} product{total !== 1 ? 's' : ''}
                  </span>
                  <Link href="/products" className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1">
                    Browse all products <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-white text-xl font-bold">Category not found</p>
              <Link href="/categories" className="text-brand-400 text-sm mt-2 inline-block">← Back to categories</Link>
            </div>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18 py-8 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400" aria-live="polite">
            {loading ? 'Loading products…' : `${total} product${total !== 1 ? 's' : ''} in ${category?.name ?? 'this category'}`}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white dark:bg-[#0c1526] border border-slate-200 dark:border-white/[0.07] rounded-xl px-3 py-2 shadow-sm">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <label htmlFor="category-sort" className="sr-only">Sort products</label>
              <select
                id="category-sort"
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="text-sm font-medium text-slate-700 dark:text-slate-200 bg-transparent border-none outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {isAuthenticated && (
              <Link href="/products/new">
                <Button size="sm" icon={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}
                  className="bg-gradient-to-r from-brand-600 to-brand-700 shadow-md shadow-brand-900/20">
                  Add Product
                </Button>
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" aria-label="Loading products" aria-busy="true">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-20 w-20 rounded-3xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center mx-auto mb-5">
              <Package className="h-10 w-10 text-brand-400" aria-hidden="true" />
            </div>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">No products in this category yet</p>
            <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">
              Be the first to add a product to {category?.name ?? 'this category'}.
            </p>
            {isAuthenticated
              ? <Link href="/products/new"><Button size="sm" icon={<Plus className="h-4 w-4" aria-hidden="true" />}>Add a Product</Button></Link>
              : <Link href="/register"><Button size="sm">Sign up to add products</Button></Link>}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <Pagination page={page} totalPages={totalPages}
                  onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
