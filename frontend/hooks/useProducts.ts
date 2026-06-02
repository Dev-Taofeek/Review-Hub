'use client';

import { useState, useEffect, useCallback } from 'react';
import { productsApi } from '@/lib/api';
import type { Product, Category } from '@/types';

interface Filters {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  sortBy?: string;
  page?: number;
}

export function useProducts(initialFilters: Filters = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal]       = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [filters, setFilters]   = useState<Filters>(initialFilters);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (filters.search)    params.search   = filters.search;
      if (filters.category)  params.category = filters.category;
      if (filters.brand)     params.brand    = filters.brand;
      if (filters.minPrice)  params.minPrice = filters.minPrice;
      if (filters.maxPrice)  params.maxPrice = filters.maxPrice;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.sortBy)    params.sortBy   = filters.sortBy;
      if (filters.page)      params.page     = String(filters.page);

      const res = await productsApi.getAll(params);
      setProducts(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  return { products, total, totalPages, loading, error, filters, setFilters, refetch: fetch };
}

export function useProduct(idOrSlug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!idOrSlug) return;
    setLoading(true);
    productsApi
      .getOne(idOrSlug)
      .then((res) => setProduct(res.data ?? null))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  return { product, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    productsApi
      .getCategories()
      .then((res) => setCategories(res.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
