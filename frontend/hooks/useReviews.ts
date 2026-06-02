'use client';

import { useState, useEffect, useCallback } from 'react';
import { reviewsApi } from '@/lib/api';
import type { Review } from '@/types';

export function useReviews(productId: string, page = 1) {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [total, setTotal]       = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await reviewsApi.getByProduct(productId, { page, limit: 10 });
      setReviews(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [productId, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const addReview = (review: Review) => {
    setReviews((prev) => [review, ...prev]);
    setTotal((t) => t + 1);
  };

  const updateReview = (updated: Review) => {
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const removeReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  };

  return { reviews, total, totalPages, loading, error, addReview, updateReview, removeReview, refetch: fetch };
}

export function useMyReviews(page = 1) {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [total, setTotal]       = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    reviewsApi
      .getMyReviews({ page, limit: 10 })
      .then((res) => {
        setReviews(res.data);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return { reviews, total, totalPages, loading };
}
