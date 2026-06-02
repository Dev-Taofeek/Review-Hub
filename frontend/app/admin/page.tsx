'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3, Users, Package, MessageSquare, Flag, TrendingUp,
  Star, ArrowRight, Activity, CheckCircle2, Clock,
} from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminApi } from '@/lib/api';
import { formatRelativeTime, cn } from '@/lib/utils';

interface Analytics {
  users:    { total: number; newThisMonth: number };
  products: { total: number };
  reviews:  { total: number; newThisMonth: number };
  reports:  { total: number };
  topProducts: Array<{ id: string; name: string; total_reviews: number; average_rating: number }>;
  recentActivity: Array<{ id: string; title: string; rating: number; created_at: string; user: { username: string } | null }>;
}

const RATING_COLORS = ['', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-lime-400', 'bg-emerald-500'];

export default function AdminOverviewPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAnalytics()
      .then((res) => setAnalytics(res.data as Analytics))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const maxReviews = Math.max(...analytics.topProducts.map(p => p.total_reviews), 1);

  return (
    <div className="space-y-6">

      {/* ── Welcome banner ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 sm:p-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 40px)' }}
          />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-1">Admin Panel</p>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Platform Overview</h1>
            <p className="text-gray-400 text-sm mt-1">Real-time metrics across your entire platform</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/users">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-sm font-medium text-white hover:bg-white/20 transition-colors">
                <Users className="h-4 w-4" /> Manage Users
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── KPI cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title="Total Users"
          value={analytics.users.total}
          icon={<Users />}
          color="blue"
          change={`+${analytics.users.newThisMonth} this month`}
          changePositive
        />
        <StatsCard
          title="Products"
          value={analytics.products.total}
          icon={<Package />}
          color="purple"
        />
        <StatsCard
          title="Reviews"
          value={analytics.reviews.total}
          icon={<MessageSquare />}
          color="emerald"
          change={`+${analytics.reviews.newThisMonth} this month`}
          changePositive
        />
        <StatsCard
          title="Open Reports"
          value={analytics.reports.total}
          icon={<Flag />}
          color="amber"
        />
      </div>

      {/* ── Two-column section ─────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Top Products */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-dark-muted shadow-card overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-white/8 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-500" />
              Most Reviewed Products
            </h2>
            <Link href="/admin/products" className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium flex items-center gap-1">
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            {analytics.topProducts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No products yet</p>
            ) : analytics.topProducts.map((p, i) => {
              const pct = Math.round((p.total_reviews / maxReviews) * 100);
              return (
                <div key={p.id}>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="w-5 shrink-0 text-xs font-bold text-gray-400">{i + 1}</span>
                    <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{p.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {p.average_rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 w-16 text-right">
                      {p.total_reviews} review{p.total_reviews !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="ml-8 h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-dark-muted shadow-card overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-white/8 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand-500" />
              Recent Reviews
            </h2>
            <Link href="/moderation" className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium flex items-center gap-1">
              Moderate <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-white/8">
            {analytics.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No reviews yet</p>
            ) : analytics.recentActivity.slice(0, 8).map((r) => (
              <div key={r.id} className="px-5 sm:px-6 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                {/* Rating dot */}
                <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0', RATING_COLORS[r.rating] || 'bg-gray-400')}>
                  {r.rating}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{r.title}</p>
                  {r.user && (
                    <p className="text-xs text-gray-400 mt-0.5">@{r.user.username}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 shrink-0">{formatRelativeTime(r.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Platform health strip ─────────────────────── */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-dark-muted shadow-card p-5 sm:p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
          <BarChart3 className="h-4 w-4 text-brand-500" />
          Platform Health
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'Review Rate',
              value: analytics.products.total > 0
                ? `${(analytics.reviews.total / analytics.products.total).toFixed(1)} / product`
                : '—',
              icon: <MessageSquare className="h-4 w-4" />,
              color: 'text-brand-600 bg-brand-50 dark:bg-brand-950/30',
            },
            {
              label: 'New this month',
              value: `${analytics.reviews.newThisMonth} reviews`,
              icon: <Activity className="h-4 w-4" />,
              color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
            },
            {
              label: 'Open Reports',
              value: analytics.reports.total,
              icon: <Flag className="h-4 w-4" />,
              color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
            },
            {
              label: 'New Users',
              value: `${analytics.users.newThisMonth} this month`,
              icon: <Users className="h-4 w-4" />,
              color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30',
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', item.color)}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</p>
                <p className="text-xs text-gray-400">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
