'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Star, ThumbsUp, BookOpen, Clock, CheckCircle2,
  AlertTriangle, XCircle, TrendingUp, ArrowRight,
  Package, MessageSquare, Award, BarChart2, Plus,
  Sparkles, Activity,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { RoleBadge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { cn, formatRelativeTime, getStatusColor, truncate } from '@/lib/utils';

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

const STATUS_META: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  published: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Published', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  pending:   { icon: <Clock className="h-3.5 w-3.5" />,        label: 'Pending',   color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  flagged:   { icon: <AlertTriangle className="h-3.5 w-3.5" />, label: 'Flagged',  color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200' },
  rejected:  { icon: <XCircle className="h-3.5 w-3.5" />,      label: 'Rejected',  color: 'text-red-700',     bg: 'bg-red-50 border-red-200' },
};

const STAT_CARDS = [
  {
    key: 'totalReviews',
    label: 'Total Reviews',
    sub: (ov: any) => `+${ov.reviewsThisMonth} this month`,
    icon: <BookOpen className="h-5 w-5" />,
    gradient: 'from-brand-600 to-brand-500',
    glow: 'shadow-brand-sm',
    textColor: 'text-white',
  },
  {
    key: 'publishedReviews',
    label: 'Published',
    sub: (ov: any) => ov.totalReviews > 0 ? `${Math.round((ov.publishedReviews / ov.totalReviews) * 100)}% approval rate` : 'No reviews yet',
    icon: <CheckCircle2 className="h-5 w-5" />,
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'shadow-[0_4px_16px_rgba(16,185,129,0.3)]',
    textColor: 'text-white',
  },
  {
    key: 'totalHelpfulVotes',
    label: 'Helpful Votes',
    sub: () => 'received on your reviews',
    icon: <ThumbsUp className="h-5 w-5" />,
    gradient: 'from-violet-600 to-purple-500',
    glow: 'shadow-[0_4px_16px_rgba(139,92,246,0.3)]',
    textColor: 'text-white',
  },
  {
    key: 'averageRating',
    label: 'Avg Rating',
    sub: (ov: any) => ov.publishedReviews > 0 ? `across ${ov.publishedReviews} reviews` : 'no published reviews',
    icon: <Star className="h-5 w-5" />,
    gradient: 'from-amber-500 to-orange-400',
    glow: 'shadow-[0_4px_16px_rgba(245,158,11,0.3)]',
    textColor: 'text-white',
    format: (v: number) => v > 0 ? v.toFixed(1) : '—',
  },
];

// ── SVG Donut Chart ─────────────────────────────────────────────────────────
function DonutChart({ segments }: { segments: Array<{ pct: number; color: string }> }) {
  const R = 40; const C = 2 * Math.PI * R;
  let cumulative = 0;
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
      <circle cx="50" cy="50" r={R} fill="none" strokeWidth="14" stroke="currentColor" className="text-gray-100 dark:text-white/10" />
      {segments.filter(s => s.pct > 0).map((seg, i) => {
        const dash = (seg.pct / 100) * C;
        const offset = -(cumulative / 100) * C;
        cumulative += seg.pct;
        return (
          <circle key={i} cx="50" cy="50" r={R} fill="none" strokeWidth="14"
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
    color: '#10b981', hex: '#10b981',
    label: 'Published',
    desc: 'Live on the platform — visible to all shoppers and influencing the product rating.',
    icon: <CheckCircle2 className="h-4 w-4" />,
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800/50',
  },
  pending: {
    color: '#f59e0b', hex: '#f59e0b',
    label: 'Pending',
    desc: 'Awaiting moderator review before being published. Typically reviewed within 24 hours.',
    icon: <Clock className="h-4 w-4" />,
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800/50',
  },
  flagged: {
    color: '#f97316', hex: '#f97316',
    label: 'Flagged',
    desc: 'Marked for closer review — may contain spam signals or was reported by the community.',
    icon: <AlertTriangle className="h-4 w-4" />,
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800/50',
  },
  rejected: {
    color: '#ef4444', hex: '#ef4444',
    label: 'Rejected',
    desc: "Didn't meet community guidelines. You can edit and resubmit or contact support.",
    icon: <XCircle className="h-4 w-4" />,
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800/50',
  },
};

function ReviewHealthCard({ ov }: { ov: NonNullable<DashboardStats['overview']> }) {
  const items = [
    { key: 'published', value: ov.publishedReviews },
    { key: 'pending',   value: ov.pendingReviews   },
    { key: 'flagged',   value: ov.flaggedReviews   },
    { key: 'rejected',  value: ov.rejectedReviews  },
  ] as const;

  const segments = items.map(({ key, value }) => ({
    pct: ov.totalReviews > 0 ? (value / ov.totalReviews) * 100 : 0,
    color: STATUS_DETAILS[key].hex,
  }));

  const publishedPct = ov.totalReviews > 0 ? Math.round((ov.publishedReviews / ov.totalReviews) * 100) : 0;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-dark-muted shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-brand-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Review Health</h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-gray-400">{ov.totalReviews} total</span>
          {publishedPct >= 70 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-semibold">
              ✓ Healthy
            </span>
          )}
          {publishedPct > 0 && publishedPct < 70 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 font-semibold">
              Needs attention
            </span>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center">

          {/* Donut chart + center label */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 shrink-0">
            <DonutChart segments={segments} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{publishedPct}%</span>
              <span className="text-xs text-gray-500 mt-0.5">published</span>
            </div>
          </div>

          {/* Status detail cards */}
          <div className="grid grid-cols-2 gap-3 flex-1 w-full">
            {items.map(({ key, value }) => {
              const d = STATUS_DETAILS[key];
              const pct = ov.totalReviews > 0 ? Math.round((value / ov.totalReviews) * 100) : 0;
              return (
                <div key={key} className={cn('rounded-xl border p-3.5', d.bg, d.border)}>
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-2">
                    <div className={cn('flex items-center gap-1.5 text-xs font-semibold', d.text)}>
                      {d.icon}
                      {d.label}
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-gray-900 dark:text-white block leading-none">{value}</span>
                      <span className="text-xs text-gray-400">{pct}%</span>
                    </div>
                  </div>

                  {/* Mini bar */}
                  <div className="h-1 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: d.hex }}
                    />
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{d.desc}</p>
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.getMyStats()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const ov = stats?.overview;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark">

      {/* ── Hero header ─────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Decorative mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 40px)' }}
          />
        </div>

        <div className="relative mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-14 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar src={user.avatar_url} name={user.full_name || user.username} size="xl" />
                <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-brand-500 border-2 border-gray-900 ring-1 ring-brand-400" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-lg sm:text-xl font-bold text-white">
                    {user.full_name || user.username || 'My Dashboard'}
                  </h1>
                  <RoleBadge role={user.role} />
                </div>
                <p className="text-sm text-gray-400 truncate max-w-xs">{user.email}</p>
                {!loading && ov && ov.reviewsThisMonth > 0 && (
                  <p className="text-xs text-brand-400 mt-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {ov.reviewsThisMonth} review{ov.reviewsThisMonth !== 1 ? 's' : ''} this month
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/products/new">
                <Button size="sm" icon={<Plus className="h-4 w-4" />} className="bg-white/10 border border-white/20 text-white hover:bg-white/20">
                  Add Product
                </Button>
              </Link>
              <Link href="/profile">
                <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-14 py-6 sm:py-8 space-y-6">

        {/* ── Gradient stat cards ─────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : ov ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {STAT_CARDS.map((card) => {
              const raw = ov[card.key as keyof typeof ov] as number;
              const value = card.format ? card.format(raw) : raw.toLocaleString();
              return (
                <div
                  key={card.key}
                  className={cn(
                    'relative overflow-hidden rounded-2xl p-5',
                    `bg-gradient-to-br ${card.gradient}`,
                    card.glow
                  )}
                >
                  {/* Background decoration */}
                  <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
                  <div className="absolute -right-2 top-8 h-12 w-12 rounded-full bg-white/5" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                        {card.icon}
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
                    <p className="text-xs text-white/80 mt-1 font-medium">{card.label}</p>
                    <p className="text-xs text-white/60 mt-0.5 truncate">{card.sub(ov)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* ── Review Health ─────────────────────────────────── */}
        {ov && ov.totalReviews > 0 && (
          <ReviewHealthCard ov={ov} />
        )}

        {/* ── Recent reviews ───────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-card dark:bg-surface-dark-muted dark:border-white/8 overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-white/8">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-brand-500" />
              Recent Reviews
            </h2>
            <Link href="/my-reviews" className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium flex items-center gap-1 group">
              View all
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="divide-y divide-gray-100 dark:divide-white/8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-56" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : !stats?.recentReviews.length ? (
            <div className="px-6 py-16 text-center">
              <div className="h-16 w-16 rounded-2xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-brand-400" />
              </div>
              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">No reviews yet</p>
              <p className="text-sm text-gray-400 mb-5">Browse products and share your first experience</p>
              <Link href="/products">
                <Button size="sm" iconRight={<ArrowRight className="h-4 w-4" />}>
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/8">
              {stats.recentReviews.map((review) => {
                const primaryImage = review.product?.images?.find(img => img.is_primary) || review.product?.images?.[0];
                const meta = STATUS_META[review.status];
                return (
                  <div key={review.id} className="px-5 sm:px-6 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    {/* Product image */}
                    <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/10 shrink-0 border border-gray-100 dark:border-white/10">
                      {primaryImage ? (
                        <img src={primaryImage.url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {review.product && (
                        <Link href={`/products/${review.product.slug}`} className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline truncate block">
                          {review.product.name}
                        </Link>
                      )}
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate mt-0.5">
                        {truncate(review.title, 55)}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <StarRating rating={review.rating} size="xs" />
                        <span className="text-xs text-gray-400">{formatRelativeTime(review.created_at)}</span>
                        {review.helpful_count > 0 && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" /> {review.helpful_count}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    {meta && (
                      <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border shrink-0', meta.color, meta.bg)}>
                        {meta.icon} <span className="hidden sm:inline">{meta.label}</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Quick actions ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            {
              href:  '/products',
              icon:  <TrendingUp className="h-5 w-5" />,
              title: 'Discover Products',
              desc:  'Browse and review new products',
              gradient: 'from-brand-600/10 to-brand-500/5',
              iconBg:   'bg-brand-100 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400',
            },
            {
              href:  '/my-reviews',
              icon:  <BookOpen className="h-5 w-5" />,
              title: 'My Reviews',
              desc:  'Manage all your submitted reviews',
              gradient: 'from-violet-500/10 to-purple-500/5',
              iconBg:   'bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400',
            },
            {
              href:  '/products/new',
              icon:  <Plus className="h-5 w-5" />,
              title: 'Add a Product',
              desc:  "Can't find it? Add it yourself",
              gradient: 'from-amber-500/10 to-orange-500/5',
              iconBg:   'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400',
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                'group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-dark-muted',
                'p-5 flex items-start gap-4 card-hover shadow-card'
              )}
            >
              <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity', action.gradient)} />
              <div className={cn('relative h-10 w-10 rounded-xl flex items-center justify-center shrink-0', action.iconBg)}>
                {action.icon}
              </div>
              <div className="relative flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{action.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
              </div>
              <ArrowRight className="relative h-4 w-4 text-gray-400 self-center group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
