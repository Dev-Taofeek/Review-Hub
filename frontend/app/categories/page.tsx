'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Package, Layers, Search } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

/* Gradient palettes cycling through categories */
const GRADIENTS = [
  { from: '#059669', to: '#047857', shadow: 'rgba(5,150,105,0.35)' },
  { from: '#2563eb', to: '#1d4ed8', shadow: 'rgba(37,99,235,0.35)' },
  { from: '#7c3aed', to: '#6d28d9', shadow: 'rgba(124,58,237,0.35)' },
  { from: '#db2777', to: '#be185d', shadow: 'rgba(219,39,119,0.35)' },
  { from: '#d97706', to: '#b45309', shadow: 'rgba(217,119,6,0.35)' },
  { from: '#0891b2', to: '#0e7490', shadow: 'rgba(8,145,178,0.35)' },
  { from: '#dc2626', to: '#b91c1c', shadow: 'rgba(220,38,38,0.35)' },
  { from: '#16a34a', to: '#15803d', shadow: 'rgba(22,163,74,0.35)' },
  { from: '#9333ea', to: '#7e22ce', shadow: 'rgba(147,51,234,0.35)' },
  { from: '#ea580c', to: '#c2410c', shadow: 'rgba(234,88,12,0.35)' },
  { from: '#0284c7', to: '#0369a1', shadow: 'rgba(2,132,199,0.35)' },
  { from: '#4f46e5', to: '#4338ca', shadow: 'rgba(79,70,229,0.35)' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');

  useEffect(() => {
    productsApi.getCategories()
      .then((res) => setCategories(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
      )
    : categories;

  const totalProducts = categories.reduce((sum, c) => sum + (c.product_count ?? 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060c1a]">

      {/* ── Hero banner ───────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #020817 0%, #061529 40%, #09233d 100%)' }}
      >
        <div className="absolute -top-32 right-0 w-[600px] h-[500px] rounded-full opacity-50"
          style={{ background: 'radial-gradient(ellipse, rgba(5,150,105,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 hero-grid-overlay" />

        <div className="relative mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-18 py-14 sm:py-18">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
                <Layers className="h-5 w-5 text-brand-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-400">Browse Categories</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
              Find what you're<br />
              <span className="text-gradient">looking for faster</span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              {loading
                ? 'Browsing categories…'
                : `${categories.length} categories · ${totalProducts.toLocaleString()} products — all with verified community reviews.`}
            </p>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search categories…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/10 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Categories grid ───────────────────────────────── */}
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-18 py-10 sm:py-14">

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center mx-auto mb-5">
              <Package className="h-10 w-10 text-slate-400" />
            </div>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
              {search ? 'No categories match your search' : 'No categories yet'}
            </p>
            <p className="text-sm text-slate-400">
              {search ? 'Try a different keyword' : 'Categories will appear here once products are added'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {search
                  ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"`
                  : `${filtered.length} categories`}
              </p>
              <Link href="/products"
                className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 group">
                Browse all products
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filtered.map((cat, i) => {
                const grad = GRADIENTS[i % GRADIENTS.length];
                return (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-white/[0.07] bg-white dark:bg-[#0c1526] hover:-translate-y-1 hover:shadow-xl transition-all duration-200 cursor-pointer"
                    style={{ '--hover-shadow': grad.shadow } as React.CSSProperties}
                  >
                    {/* Top gradient strip */}
                    <div
                      className="h-1.5 w-full"
                      style={{ background: `linear-gradient(90deg, ${grad.from}, ${grad.to})` }}
                    />

                    <div className="p-5 flex flex-col items-center text-center gap-3">
                      {/* Icon circle */}
                      <div
                        className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-200"
                        style={{
                          background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                          boxShadow: `0 6px 20px ${grad.shadow}`,
                        }}
                      >
                        {cat.icon || '📦'}
                      </div>

                      {/* Name */}
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {cat.name}
                        </p>
                        {cat.description && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                            {cat.description}
                          </p>
                        )}
                      </div>

                      {/* Product count badge */}
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ background: `${grad.from}18`, color: grad.from }}>
                        <Package className="h-3 w-3" />
                        {cat.product_count ?? 0} product{(cat.product_count ?? 0) !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Arrow on hover */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-6 w-6 rounded-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})` }}>
                        <ArrowRight className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
