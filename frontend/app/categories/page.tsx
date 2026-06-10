'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Package, Search } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    productsApi.getCategories()
      .then((res) => setCategories(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? categories.filter((category) => category.name.toLowerCase().includes(search.toLowerCase()) || category.description?.toLowerCase().includes(search.toLowerCase()))
    : categories;
  const totalProducts = categories.reduce((sum, category) => sum + (category.product_count ?? 0), 0);

  return (
    <div className="trust-shell min-h-screen">
      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-[1600px] px-4 py-12 xs:px-5 sm:px-8 lg:px-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <p className="mb-3 text-label-mono text-[var(--primary)]">Category directory</p>
              <h1 className="max-w-3xl text-4xl font-black leading-tight text-[var(--foreground)] sm:text-5xl">
                Product spaces organized for careful comparison.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">
                {loading ? 'Loading categories...' : `${categories.length} categories and ${totalProducts.toLocaleString()} products with community review evidence.`}
              </p>
            </div>
            <label className="relative block">
              <span className="sr-only">Search categories</span>
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search categories"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-11 pr-4 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]"
              />
            </label>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-4 py-10 xs:px-5 sm:px-8 lg:px-20">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => <Skeleton key={index} className="h-36" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="trust-card py-20 text-center">
            <Package className="mx-auto mb-5 h-10 w-10 text-[var(--primary)]" />
            <p className="mb-2 text-lg font-black text-[var(--foreground)]">{search ? 'No categories match your search' : 'No categories yet'}</p>
            <p className="text-sm text-[var(--muted)]">{search ? 'Try a different keyword.' : 'Categories will appear here once products are added.'}</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between border-b border-[var(--border)] pb-4">
              <p className="text-sm font-bold text-[var(--muted)]">
                {search ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"` : `${filtered.length} categories`}
              </p>
              <Link href="/products" className="flex items-center gap-1 text-sm font-black text-[var(--primary)]">
                Browse all products <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((category) => (
                <Link key={category.id} href={`/categories/${category.slug}`} className="trust-card trust-card-hover block rounded-lg p-5">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-label-mono text-[var(--primary)]">{category.icon || 'Category'}</p>
                      <h2 className="mt-2 text-xl font-black text-[var(--foreground)]">{category.name}</h2>
                      {category.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{category.description}</p>}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-2xl font-black tabular-nums text-[var(--foreground)]">{category.product_count ?? 0}</p>
                      <p className="text-xs font-bold text-[var(--muted)]">products</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
