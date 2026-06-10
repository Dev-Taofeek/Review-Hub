'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Layers, Package, Search } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { staggerContainer, staggerItem, pageTransition } from '@/lib/animations';
import type { Category } from '@/types';

const ACCENTS = ['#047857', '#0891B2', '#F59E0B', '#10B981'];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const reduced = useReducedMotion();

  useEffect(() => {
    productsApi.getCategories()
      .then((res) => setCategories(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()))
    : categories;
  const totalProducts = categories.reduce((sum, c) => sum + (c.product_count ?? 0), 0);

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible" className="trust-shell min-h-screen">
      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-[1600px] px-4 py-12 xs:px-5 sm:px-8 lg:px-20">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-label-mono text-[var(--primary)]">Browse Categories</span>
            </div>
            <h1 className="text-4xl font-black leading-tight text-[var(--foreground)] sm:text-5xl">
              Explore trusted product spaces.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">
              {loading ? 'Browsing categories...' : `${categories.length} categories / ${totalProducts.toLocaleString()} products with verified community reviews.`}
            </p>
            <div className="relative mt-7 max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-11 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-4 py-10 xs:px-5 sm:px-8 lg:px-20">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-3xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="trust-card rounded-3xl py-20 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--surface-soft)]">
              <Package className="h-10 w-10 text-[var(--primary)]" />
            </div>
            <p className="mb-2 text-lg font-black text-[var(--foreground)]">{search ? 'No categories match your search' : 'No categories yet'}</p>
            <p className="text-sm text-[var(--muted)]">{search ? 'Try a different keyword' : 'Categories will appear here once products are added'}</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-bold text-[var(--muted)]">
                {search ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"` : `${filtered.length} categories`}
              </p>
              <Link href="/products" className="group flex items-center gap-1 text-sm font-bold text-[var(--primary)]">
                Browse all products <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <motion.div variants={reduced ? {} : staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {filtered.map((cat, i) => {
                const accent = ACCENTS[i % ACCENTS.length];
                return (
                  <motion.div key={cat.id} variants={reduced ? {} : staggerItem} whileHover={reduced ? {} : { y: -5 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
                    <Link href={`/categories/${cat.slug}`} className="trust-card trust-card-hover group block overflow-hidden rounded-3xl">
                      <div className="h-1.5 w-full" style={{ background: accent }} />
                      <div className="flex flex-col items-center gap-3 p-5 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl" style={{ background: `${accent}18`, color: accent }}>
                          {cat.icon || 'Box'}
                        </div>
                        <div>
                          <p className="text-sm font-black leading-tight text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">{cat.name}</p>
                          {cat.description && <p className="mt-1 line-clamp-1 text-xs text-[var(--muted)]">{cat.description}</p>}
                        </div>
                        <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-black text-[var(--muted)]">
                          <Package className="h-3 w-3" />
                          {cat.product_count ?? 0} product{(cat.product_count ?? 0) !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
