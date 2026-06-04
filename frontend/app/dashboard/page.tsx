'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Star, ThumbsUp, BookOpen, Clock, CheckCircle2,
  AlertTriangle, XCircle, TrendingUp, ArrowRight,
  Package, MessageSquare, Award, BarChart2, Plus,
  Sparkles, Activity, Zap, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { RoleBadge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { cn, formatRelativeTime, truncate } from '@/lib/utils';
import { staggerContainer, staggerItem, fadeInUp, slideInLeft, slideInRight } from '@/lib/animations';

interface DashboardStats {
  overview: {
    totalReviews: number;
    publishedReviews: number;
    pendingReviews: number;
    flaggedReviews: number;
    rejectedReviews: number;
    totalHelpfulVotes: number;
    averageRating: number;
    reviewsThisMonth: number;
  };
  recentReviews: Array<{
    id: string;
    status: string;
    rating: number;
    helpful_count: number;
    created_at: string;
    title: string;
    product: { id: string; name: string; slug: string; images: Array<{ url: string; is_primary: boolean }> } | null;
  }>;
}

const STATUS_META: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string; dot: string }> = {
  published: {
    icon: <CheckCircle2 className="h-3 w-3" />,
    label: 'Published',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/40',
    dot: 'bg-emerald-500',
  },
  pending: {
    icon: <Clock className="h-3 w-3" />,
    label: 'Pending',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/40',
    dot: 'bg-amber-500',
  },
  flagged: {
    icon: <AlertTriangle className="h-3 w-3" />,
    label: 'Flagged',
    color: 'text-orange-700 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200/60 dark:border-orange-800/40',
    dot: 'bg-orange-500',
  },
  rejected: {
    icon: <XCircle className="h-3 w-3" />,
    label: 'Rejected',
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/40 border-red-200/60 dark:border-red-800/40',
    dot: 'bg-red-500',
  },
};

const STAT_CARDS = [
  {
    key: 'totalReviews',
    label: 'Total Reviews',
    sub: (ov: any) => `+${ov.reviewsThisMonth} this month`,
    icon: <BookOpen className="h-5 w-5" />,
    from: '#059669', to: '#047857',
    glow: '0 8px 32px rgba(5,150,105,0.35)',
  },
  {
    key: 'publishedReviews',
    label: 'Published',
    sub: (ov: any) => ov.totalReviews > 0
      ? `${Math.round((ov.publishedReviews / ov.totalReviews) * 100)}% approval`
      : 'No reviews yet',
    icon: <CheckCircle2 className="h-5 w-5" />,
    from: '#0ea5e9', to: '#0284c7',
    glow: '0 8px 32px rgba(14,165,233,0.35)',
  },
  {
    key: 'totalHelpfulVotes',
    label: 'Helpful Votes',
    sub: () => 'community validated',
    icon: <ThumbsUp className="h-5 w-5" />,
    from: '#7c3aed', to: '#6d28d9',
    glow: '0 8px 32px rgba(124,58,237,0.35)',
  },
  {
    key: 'averageRating',
    label: 'Avg Rating',
    sub: (ov: any) => ov.publishedReviews > 0
      ? `across ${ov.publishedReviews} reviews`
      : 'no reviews yet',
    icon: <Star className="h-5 w-5" />,
    from: '#f59e0b', to: '#d97706',
    glow: '0 8px 32px rgba(245,158,11,0.35)',
    format: (v: number) => v > 0 ? v.toFixed(1) : '—',
  },
];

/* ── SVG Donut Chart ── */
function DonutChart({ segments }: { segments: Array<{ pct: number; color: string }> }) {
  const R = 38; const C = 2 * Math.PI * R;
  let cumulative = 0;
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
      <circle cx="50" cy="50" r={R} fill="none" strokeWidth="12" stroke="currentColor"
        className="text-slate-100 dark:text-white/[0.06]" />
      {segments.filter(s => s.pct > 0).map((seg, i) => {
        const dash = (seg.pct / 100) * C;
        const offset = -(cumulative / 100) * C;
        cumulative += seg.pct;
        return (
          <circle key={i} cx="50" cy="50" r={R} fill="none" strokeWidth="12"
            stroke={seg.color} strokeDasharray={`${dash} ${C}`}
            strokeDashoffset={offset} strokeLinecap="butt"
            className="transition-all duration-700"
          />
        );
      })}
    </svg>
  );
}

const STATUS_DETAILS = {
  published: {
    hex: '#10b981',
    label: 'Published',
    desc: 'Live on the platform — visible to all shoppers.',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200/60 dark:border-emerald-800/40',
    bar: 'bg-emerald-500',
  },
  pending: {
    hex: '#f59e0b',
    label: 'Pending',
    desc: 'Awaiting moderator review — typically within 24h.',
    icon: <Clock className="h-3.5 w-3.5" />,
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200/60 dark:border-amber-800/40',
    bar: 'bg-amber-500',
  },
  flagged: {
    hex: '#f97316',
    label: 'Flagged',
    desc: 'Marked for closer review — may contain spam signals.',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200/60 dark:border-orange-800/40',
    bar: 'bg-orange-500',
  },
  rejected: {
    hex: '#ef4444',
    label: 'Rejected',
    desc: "Didn't meet guidelines — edit and resubmit.",
    icon: <XCircle className="h-3.5 w-3.5" />,
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200/60 dark:border-red-800/40',
    bar: 'bg-red-500',
  },
};

function ReviewHealthCard({ ov }: { ov: NonNullable<DashboardStats['overview']> }) {
  const items = [
    { key: 'published' as const, value: ov.publishedReviews },
    { key: 'pending'   as const, value: ov.pendingReviews   },
    { key: 'flagged'   as const, value: ov.flaggedReviews   },
    { key: 'rejected'  as const, value: ov.rejectedReviews  },
  ];

  const segments = items.map(({ key, value }) => ({
    pct: ov.totalReviews > 0 ? (value / ov.totalReviews) * 100 : 0,
    color: STATUS_DETAILS[key].hex,
  }));

  const publishedPct = ov.totalReviews > 0 ? Math.round((ov.publishedReviews / ov.totalReviews) * 100) : 0;
  const isHealthy = publishedPct >= 70;

  return (
    <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.07] bg-white dark:bg-[#0c1526] shadow-sm overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <h2 className="font-bold text-slate-900 dark:text-white">Review Health</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400">{ov.totalReviews} total</span>
          {publishedPct >= 70 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200/60 dark:border-emerald-800/40">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Healthy
            </span>
          )}
          {publishedPct > 0 && publishedPct < 70 && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-200/60 dark:border-amber-800/40">
              Needs attention
            </span>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Donut */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 shrink-0">
            <DonutChart segments={segments} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-4xl font-bold tabular-nums text-slate-900 dark:text-white leading-none">{publishedPct}<span className="text-xl font-semibold text-slate-400">%</span></span>
              <span className="text-xs font-medium text-slate-500 mt-1">published</span>
            </div>
          </div>

          {/* Status breakdown */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 flex-1 w-full">
            {items.map(({ key, value }) => {
              const d = STATUS_DETAILS[key];
              const pct = ov.totalReviews > 0 ? Math.round((value / ov.totalReviews) * 100) : 0;
              return (
                <div key={key} className={cn('rounded-xl border p-3.5 transition-all hover:shadow-sm', d.bg, d.border)}>
                  <div className="flex items-start justify-between mb-2.5">
                    <div className={cn('flex items-center gap-1.5 text-xs font-bold', d.text)}>
                      {d.icon}
                      {d.label}
                    </div>
                    <div className="text-right leading-none">
                      <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">{value}</span>
                      <span className="text-xs text-slate-400 block mt-0.5">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden mb-2.5">
                    <div className={cn('h-full rounded-full transition-all duration-700', d.bar)} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{d.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const reduced = useReducedMotion();

  /* Time-of-day greeting */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    authApi.getMyStats()
      .then((res) => setStats(res.data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;
  const ov = stats?.overview;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060c1a]">

      {/* ── Hero Header ─────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #020817 0%, #061529 35%, #09233d 60%, #071d35 100%)' }}
      >
        {/* Ambient orbs */}
        <div className="absolute -top-32 right-0 w-[700px] h-[500px] rounded-full opacity-60"
          style={{ background: 'radial-gradient(ellipse, rgba(5,150,105,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[400px] rounded-full opacity-50"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.09) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 hero-grid-overlay opacity-100" />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16"
          style={{ background: 'linear-gradient(to top, #060c1a, transparent)' }} />

        <motion.div
          variants={reduced ? {} : staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18 py-6 xs:py-8 sm:py-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:justify-between">

            {/* Left: user info */}
            <motion.div variants={reduced ? {} : slideInLeft} className="flex items-center gap-5">
              <div className="relative">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden ring-2 ring-brand-500/40 ring-offset-2 ring-offset-transparent shadow-2xl shadow-brand-900/50">
                  <Avatar src={user.avatar_url} name={user.full_name || user.username} size="xl" className="h-full w-full" />
                </div>
                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-[#020817] flex items-center justify-center shadow-lg">
                  <span className="h-2 w-2 rounded-full bg-white" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-400/80">{greeting}</p>
                </div>
                <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight tracking-tight">
                  {user.full_name || user.username || 'My Dashboard'}
                </h1>
                <div className="flex flex-wrap items-center gap-2.5 mt-2">
                  <p className="text-sm text-slate-400">{user.email}</p>
                  <RoleBadge role={user.role} />
                  {!loading && ov && ov.reviewsThisMonth > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 bg-brand-950/60 border border-brand-800/40 px-2 py-0.5 rounded-full">
                      <Sparkles className="h-3 w-3" />
                      {ov.reviewsThisMonth} review{ov.reviewsThisMonth !== 1 ? 's' : ''} this month
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right: actions */}
            <motion.div variants={reduced ? {} : slideInRight} className="flex items-center gap-2 flex-wrap">
              <Link href="/products/new">
                <Button size="sm" icon={<Plus className="h-4 w-4" />}
                  className="bg-brand-600 hover:bg-brand-500 text-white border-brand-500/50 shadow-lg shadow-brand-900/30">
                  Add Product
                </Button>
              </Link>
              <Link href="/profile">
                <Button size="sm" variant="ghost"
                  className="text-slate-300 hover:text-white hover:bg-white/10 border border-white/10">
                  Edit Profile
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18 -mt-4 pb-10 space-y-6">

        {/* ── Stat Cards ─────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : ov ? (
          <motion.div
            variants={reduced ? {} : staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {STAT_CARDS.map((card, idx) => {
              const raw = ov[card.key as keyof typeof ov] as number;
              const value = card.format ? card.format(raw) : raw.toLocaleString();
              return (
                <motion.div
                  key={card.key}
                  variants={reduced ? {} : staggerItem}
                  whileHover={reduced ? {} : { y: -4, transition: { duration: 0.2 } }}
                  className="relative overflow-hidden rounded-2xl p-5 group"
                  style={{
                    background: `linear-gradient(135deg, ${card.from} 0%, ${card.to} 100%)`,
                    boxShadow: card.glow,
                  }}
                >
                  {/* Decorations */}
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                  <div className="absolute -right-2 top-12 h-14 w-14 rounded-full bg-white/5" />
                  <div className="absolute inset-0 card-texture" />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-sm">
                        {card.icon}
                      </div>
                      <Zap className="h-3.5 w-3.5 text-white/30" />
                    </div>
                    <p className="text-3xl sm:text-4xl font-bold text-white tabular-nums leading-none animate-number-up">{value}</p>
                    <p className="text-sm font-semibold text-white/90 mt-1.5">{card.label}</p>
                    <p className="text-xs text-white/60 mt-0.5 truncate">{card.sub(ov)}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : null}

        {/* ── Review Health ───────────────────────────────────── */}
        {ov && ov.totalReviews > 0 && (
          <ReviewHealthCard ov={ov} />
        )}

        {/* ── Recent Reviews ──────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.07] bg-white dark:bg-[#0c1526] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-white/[0.05]">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-sm">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-white">Recent Reviews</h2>
            </div>
            <Link href="/my-reviews"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors group">
              View all
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-36" />
                    <Skeleton className="h-3 w-52" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              ))}
            </div>
          ) : !stats?.recentReviews.length ? (
            <div className="px-6 py-20 text-center">
              <div className="inline-flex h-20 w-20 rounded-3xl bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-950/60 dark:to-brand-950/20 items-center justify-center mx-auto mb-5 shadow-inner">
                <Award className="h-10 w-10 text-brand-400" />
              </div>
              <p className="font-bold text-slate-700 dark:text-slate-300 text-lg mb-1">No reviews yet</p>
              <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">Browse products and share your first experience with the community</p>
              <Link href="/products">
                <Button size="sm" iconRight={<ArrowRight className="h-4 w-4" />}
                  className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-md shadow-brand-900/20">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {stats.recentReviews.map((review) => {
                const primaryImage = review.product?.images?.find(img => img.is_primary) || review.product?.images?.[0];
                const meta = STATUS_META[review.status];
                return (
                  <div key={review.id}
                    className="px-5 sm:px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors group">
                    {/* Product image */}
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/[0.06] shrink-0 border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
                      {primaryImage ? (
                        <img src={primaryImage.url} alt={review.product?.name ?? 'Product image'} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {review.product && (
                        <Link href={`/products/${review.product.slug}`}
                          className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 truncate block transition-colors">
                          {review.product.name}
                        </Link>
                      )}
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                        {truncate(review.title, 55)}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <StarRating rating={review.rating} size="xs" />
                        <span className="text-xs text-slate-400">{formatRelativeTime(review.created_at)}</span>
                        {review.helpful_count > 0 && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" /> {review.helpful_count}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status badge */}
                    {meta && (
                      <span className={cn(
                        'inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border shrink-0',
                        meta.color, meta.bg
                      )}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
                        <span className="hidden sm:inline">{meta.label}</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Quick Actions ────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1">Quick Actions</h2>
          <motion.div
            variants={reduced ? {} : staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
          >
            {[
              {
                href:      '/products',
                icon:      <TrendingUp className="h-5 w-5" />,
                title:     'Discover Products',
                desc:      'Browse and review new products',
                gradient:  'from-brand-600 to-teal-600',
                glow:      '0 4px 20px rgba(5,150,105,0.25)',
                bgFrom:    'from-brand-50',
                hoverFrom: 'group-hover:from-brand-100',
                iconColor: 'text-brand-600 dark:text-brand-400',
                iconBg:    'bg-brand-100 dark:bg-brand-950/60',
              },
              {
                href:      '/my-reviews',
                icon:      <BookOpen className="h-5 w-5" />,
                title:     'My Reviews',
                desc:      'Manage all your submitted reviews',
                gradient:  'from-violet-600 to-purple-700',
                glow:      '0 4px 20px rgba(124,58,237,0.25)',
                bgFrom:    'from-violet-50',
                hoverFrom: 'group-hover:from-violet-100',
                iconColor: 'text-violet-600 dark:text-violet-400',
                iconBg:    'bg-violet-100 dark:bg-violet-950/60',
              },
              {
                href:      '/products/new',
                icon:      <Plus className="h-5 w-5" />,
                title:     'Add a Product',
                desc:      "Can't find it? Add it to the platform",
                gradient:  'from-amber-500 to-orange-600',
                glow:      '0 4px 20px rgba(245,158,11,0.25)',
                bgFrom:    'from-amber-50',
                hoverFrom: 'group-hover:from-amber-100',
                iconColor: 'text-amber-600 dark:text-amber-400',
                iconBg:    'bg-amber-100 dark:bg-amber-950/60',
              },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-white/[0.07] bg-white dark:bg-[#0c1526] p-5 flex items-start gap-4 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                {/* Gradient background on hover */}
                <div className={cn('absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300', action.bgFrom)} />
                <div className={cn('absolute inset-0 dark:bg-gradient-to-br dark:to-transparent dark:opacity-0 dark:group-hover:opacity-100 transition-opacity duration-300')}
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.02), transparent)' }} />

                {/* Icon */}
                <div className={cn('relative h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 duration-200', action.iconBg, action.iconColor)}>
                  {action.icon}
                </div>

                <div className="relative flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{action.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{action.desc}</p>
                </div>

                <ChevronRight className="relative h-4 w-4 text-slate-300 dark:text-slate-600 self-center group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </motion.div>
        </div>

      </div>
    </div>
  );
}
