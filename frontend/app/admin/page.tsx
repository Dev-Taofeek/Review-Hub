'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  BarChart3, Users, Package, MessageSquare, Flag, TrendingUp,
  Star, ArrowRight, Activity, Zap, ArrowUpRight, Package2, RefreshCw,
} from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminApi } from '@/lib/api';
import { formatRelativeTime, cn } from '@/lib/utils';
import { staggerContainer, staggerItem, staggerFast, pageTransition, orbFloat } from '@/lib/animations';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

interface Analytics {
  users:    { total: number; newThisMonth: number };
  products: { total: number };
  reviews:  { total: number; newThisMonth: number };
  reports:  { total: number };
  topProducts: Array<{ id: string; name: string; total_reviews: number; average_rating: number }>;
  recentActivity: Array<{ id: string; title: string; rating: number; created_at: string; user: { username: string } | null }>;
}

const RATING_COLORS: Record<number, string> = {
  1: 'bg-red-500', 2: 'bg-orange-500', 3: 'bg-amber-400', 4: 'bg-lime-500', 5: 'bg-emerald-500',
};
const RATING_EMOJI: Record<number, string> = { 1:'😞', 2:'😐', 3:'🙂', 4:'😊', 5:'🌟' };

export default function AdminOverviewPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const reduced = useReducedMotion();

  const load = () => {
    adminApi.getAnalytics()
      .then((res) => setAnalytics(res.data as Analytics))
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 rounded-2xl" />
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const maxReviews = Math.max(...analytics.topProducts.map(p => p.total_reviews), 1);
  const engagementRate = analytics.users.total > 0
    ? ((analytics.reviews.total / analytics.users.total) * 100).toFixed(1) : '0';

  return (
    <motion.div
      variants={reduced ? {} : pageTransition}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ── Command centre banner ───────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{ background: 'linear-gradient(140deg, #020917 0%, #061529 45%, #09233d 100%)' }}
      >
        {!reduced && (
          <>
            <motion.div {...orbFloat(0).animate} className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(5,150,105,0.16) 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />
            <motion.div {...orbFloat(4).animate} className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)', transform: 'translateY(40%)' }} />
          </>
        )}
        <div className="absolute inset-0 hero-grid-overlay pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 sm:justify-between">
          <motion.div variants={reduced ? {} : staggerItem} initial="hidden" animate="visible">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-brand-400">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
                Live Overview
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">Platform Command Centre</h1>
            <p className="text-slate-400 text-sm mt-1.5 max-w-lg">Real-time metrics, moderation queue, and platform health — all in one place.</p>
          </motion.div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button onClick={() => { setRefreshing(true); load(); }} disabled={refreshing}
              className={cn('flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.07] border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/[0.12] hover:text-white transition-all', refreshing && 'opacity-60 cursor-not-allowed')}>
              <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
              Refresh
            </button>
            <Link href="/admin/users">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600/20 border border-brand-500/30 text-sm font-semibold text-brand-300 hover:bg-brand-600/30 hover:border-brand-400/50 transition-all">
                <Users className="h-4 w-4" /> Manage Users <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
              </button>
            </Link>
            <Link href="/moderation">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] border border-white/12 text-sm font-semibold text-white hover:bg-white/[0.14] transition-all">
                <Flag className="h-4 w-4" /> Moderation
                {analytics.reports.total > 0 && (
                  <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">{analytics.reports.total}</span>
                )}
              </button>
            </Link>
          </div>
        </div>

        {/* Quick stats strip */}
        <div className="relative mt-6 pt-5 border-t border-white/[0.07] grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Users',   value: analytics.users.total,    icon: '👥', change: `+${analytics.users.newThisMonth}` },
            { label: 'Products',      value: analytics.products.total,  icon: '📦', change: null },
            { label: 'Reviews',       value: analytics.reviews.total,   icon: '⭐', change: `+${analytics.reviews.newThisMonth}` },
            { label: 'Engagement',    value: null,                      icon: '📊', change: `${engagementRate}%` },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">{s.icon}</span>
              <div>
                {s.value !== null
                  ? <AnimatedCounter value={s.value} className="text-xl font-black text-white tabular-nums block leading-none" />
                  : <p className="text-xl font-black text-white leading-none">{s.change}</p>
                }
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                {s.value !== null && s.change && <p className="text-[10px] font-bold text-brand-400 mt-0.5">{s.change}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── KPI stat cards ──────────────────────────────── */}
      <motion.div
        variants={reduced ? {} : staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        <motion.div variants={reduced ? {} : staggerItem}><StatsCard title="Total Users"   value={analytics.users.total}   icon={<Users />}        color="blue"   change={`+${analytics.users.newThisMonth} this month`}  changePositive /></motion.div>
        <motion.div variants={reduced ? {} : staggerItem}><StatsCard title="Products"      value={analytics.products.total} icon={<Package />}      color="purple" /></motion.div>
        <motion.div variants={reduced ? {} : staggerItem}><StatsCard title="Total Reviews" value={analytics.reviews.total} icon={<MessageSquare />} color="emerald" change={`+${analytics.reviews.newThisMonth} this month`} changePositive /></motion.div>
        <motion.div variants={reduced ? {} : staggerItem}><StatsCard title="Open Reports"  value={analytics.reports.total} icon={<Flag />}          color={analytics.reports.total > 0 ? 'amber' : 'teal'} change={analytics.reports.total > 0 ? 'Need review' : 'All clear'} changePositive={analytics.reports.total === 0} /></motion.div>
      </motion.div>

      {/* ── Two-column ──────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Top Products */}
        <motion.div
          variants={reduced ? {} : staggerItem}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="rounded-2xl border border-slate-200/60 dark:border-white/[0.07] bg-white dark:bg-[#0c1526] shadow-sm overflow-hidden"
        >
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-white">Top Products</h2>
            </div>
            <Link href="/admin/products" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 group">
              Manage <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="p-5 sm:p-6 space-y-4">
            {analytics.topProducts.length === 0 ? (
              <div className="text-center py-10">
                <Package2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No products yet</p>
              </div>
            ) : analytics.topProducts.map((p, i) => {
              const pct = Math.round((p.total_reviews / maxReviews) * 100);
              return (
                <motion.div key={p.id}
                  initial={reduced ? {} : { opacity: 0, x: -10 }}
                  whileInView={reduced ? {} : { opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-6 shrink-0 text-sm font-black text-slate-400 tabular-nums">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}`}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{p.name}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/30 rounded-full px-2 py-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{p.average_rating.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-slate-400 w-16 text-right">{p.total_reviews} rev.</span>
                    </div>
                  </div>
                  <div className="ml-9 h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 + i * 0.05 }}
                      viewport={{ once: true }}
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          variants={reduced ? {} : staggerItem}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="rounded-2xl border border-slate-200/60 dark:border-white/[0.07] bg-white dark:bg-[#0c1526] shadow-sm overflow-hidden"
        >
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-sm">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-white">Recent Reviews</h2>
            </div>
            <Link href="/moderation" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 group">
              Moderate <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <motion.div
            variants={reduced ? {} : staggerFast}
            initial="hidden"
            animate="visible"
            className="divide-y divide-slate-100 dark:divide-white/[0.04]"
          >
            {analytics.recentActivity.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No reviews yet</p>
              </div>
            ) : analytics.recentActivity.slice(0, 8).map((r) => (
              <motion.div key={r.id} variants={reduced ? {} : staggerItem}
                className="px-5 sm:px-6 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                <div className={cn('h-8 w-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm', RATING_COLORS[r.rating] || 'bg-slate-400')}>
                  {r.rating}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{r.title}</p>
                  {r.user && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="h-4 w-4 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-[8px] font-black shrink-0">
                        {(r.user.username || '?')[0].toUpperCase()}
                      </div>
                      <p className="text-xs text-slate-400">@{r.user.username}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs text-slate-400">{formatRelativeTime(r.created_at)}</span>
                  <span className="text-sm" aria-hidden="true">{RATING_EMOJI[r.rating] || '⭐'}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Platform health ─────────────────────────────── */}
      <motion.div
        variants={reduced ? {} : staggerItem}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="rounded-2xl border border-slate-200/60 dark:border-white/[0.07] bg-white dark:bg-[#0c1526] shadow-sm overflow-hidden"
      >
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-white">Platform Health</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/30 px-2.5 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Operational
          </span>
        </div>
        <div className="p-5 sm:p-6 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label:'Review Rate',  value: analytics.products.total > 0 ? `${(analytics.reviews.total/analytics.products.total).toFixed(1)} / product` : '—', icon:<MessageSquare className="h-4 w-4"/>, color:'text-brand-600  dark:text-brand-400',  bg:'bg-brand-50  dark:bg-brand-950/40',  border:'border-brand-200/50  dark:border-brand-800/30'  },
            { label:'New Reviews',  value: `${analytics.reviews.newThisMonth} this month`,  icon:<Zap           className="h-4 w-4"/>, color:'text-blue-600   dark:text-blue-400',   bg:'bg-blue-50   dark:bg-blue-950/40',   border:'border-blue-200/50   dark:border-blue-800/30'   },
            { label:'Open Reports', value: analytics.reports.total === 0 ? 'None open' : `${analytics.reports.total} pending`, icon:<Flag className="h-4 w-4"/>, color: analytics.reports.total > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400', bg: analytics.reports.total > 0 ? 'bg-amber-50 dark:bg-amber-950/40' : 'bg-emerald-50 dark:bg-emerald-950/40', border: analytics.reports.total > 0 ? 'border-amber-200/50 dark:border-amber-800/30' : 'border-emerald-200/50 dark:border-emerald-800/30' },
            { label:'New Users',    value: `${analytics.users.newThisMonth} this month`,    icon:<Users         className="h-4 w-4"/>, color:'text-violet-600 dark:text-violet-400', bg:'bg-violet-50 dark:bg-violet-950/40', border:'border-violet-200/50 dark:border-violet-800/30' },
          ].map((item) => (
            <div key={item.label} className={cn('flex items-center gap-3 rounded-xl border p-3.5', item.bg, item.border)}>
              <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', item.bg, item.color)}>{item.icon}</div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{item.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
