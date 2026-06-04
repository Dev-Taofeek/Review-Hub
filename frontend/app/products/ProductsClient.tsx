'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Package, Plus, Search } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { staggerContainer, staggerItem, fadeInUp, fadeIn } from '@/lib/animations';

export function ProductsClient() {
  const [page, setPage] = useState(1);
  const { products, total, totalPages, loading, filters, setFilters } = useProducts({ page });
  const { isAuthenticated } = useAuth();
  const reduced = useReducedMotion();

  const isFiltered = !!(filters.search || filters.category || filters.brand || filters.minPrice || filters.maxPrice || filters.minRating);

  return (
    <div className="mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18 py-8">

      {/* Header */}
      <motion.div
        variants={reduced ? {} : fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex items-start justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl xs:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Browse Products</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1" aria-live="polite">
            {loading ? 'Loading…' : total > 0 ? `${total} product${total !== 1 ? 's' : ''} found` : 'No products yet'}
          </p>
        </div>
        {isAuthenticated && (
          <Link href="/products/new">
            <motion.div whileHover={reduced ? {} : { scale: 1.03 }} whileTap={reduced ? {} : { scale: 0.97 }}>
              <Button icon={<Plus className="h-4 w-4" aria-hidden="true" />} size="sm"
                className="bg-gradient-to-r from-brand-600 to-brand-700 shadow-md shadow-brand-900/20 font-semibold">
                Add Product
              </Button>
            </motion.div>
          </Link>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        variants={reduced ? {} : fadeIn}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <ProductFilters
          initialFilters={filters}
          onFiltersChange={(f) => { setFilters({ ...f }); setPage(1); }}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            variants={reduced ? {} : staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div key={i} variants={reduced ? {} : staggerItem}>
                <ProductCardSkeleton />
              </motion.div>
            ))}
          </motion.div>

        ) : products.length === 0 ? (
          <motion.div
            key="empty"
            variants={reduced ? {} : fadeInUp}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
          >
            {isFiltered ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center mb-6 shadow-inner">
                  <Search className="h-10 w-10 text-slate-400" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No products match your filters</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 text-sm">Try adjusting your search terms or clearing some filters.</p>
                <Button variant="outline" onClick={() => setFilters({ sortBy: 'newest', search: '', category: '', brand: '', minPrice: '', maxPrice: '', minRating: '' })}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-20 w-20 rounded-3xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center mb-6 shadow-inner">
                  <Package className="h-10 w-10 text-brand-400" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No products yet</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 text-sm leading-relaxed">
                  Be the first to add a product you've bought and share your experience with the community.
                </p>
                {isAuthenticated ? (
                  <Link href="/products/new">
                    <motion.div whileHover={reduced ? {} : { scale: 1.03 }} whileTap={reduced ? {} : { scale: 0.97 }}>
                      <Button size="lg" icon={<Plus className="h-5 w-5" aria-hidden="true" />}
                        className="bg-gradient-to-r from-brand-600 to-brand-700 shadow-lg shadow-brand-900/20 font-semibold">
                        Add the first product
                      </Button>
                    </motion.div>
                  </Link>
                ) : (
                  <Link href="/register">
                    <motion.div whileHover={reduced ? {} : { scale: 1.03 }} whileTap={reduced ? {} : { scale: 0.97 }}>
                      <Button size="lg" className="bg-gradient-to-r from-brand-600 to-brand-700 font-semibold">Sign up to add products</Button>
                    </motion.div>
                  </Link>
                )}
              </div>
            )}
          </motion.div>

        ) : (
          <motion.div
            key={`grid-${filters.search}-${filters.category}-${page}`}
            variants={reduced ? {} : staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            {totalPages > 1 && (
              <motion.div
                variants={reduced ? {} : fadeIn}
                className="mt-10 flex justify-center"
              >
                <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
