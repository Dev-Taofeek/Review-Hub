'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Star, ThumbsUp, BookOpen, Clock, CheckCircle2, AlertTriangle, XCircle,
  TrendingUp, ArrowRight, Package, MessageSquare, Award, BarChart2,
  Plus, Sparkles, Activity, ChevronRight, Zap,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { RoleBadge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { cn, formatRelativeTime, truncate } from '@/lib/utils';
import {
  staggerContainer, staggerItem, staggerFast,
  pageTransition, fadeInUp, orbFloat,
} from '@/lib/animations';

interface DashboardStats {
  overview: {
    totalReviews: number; publishedReviews: number; pendingReviews: number;
    flaggedReviews: number; rejectedReviews: number; totalHelpfulVotes: number;
    averageRating: number; reviewsThisMonth: number;
  };
  recentReviews: Array<{
    id: string; status: string; rating: number; helpful_count: number;
    created_at: string; title: string;
    product: { id: string; name: string; slug: string; images: Array<{ url: string; is_primary: boolean }> } | null;
  }>;
}

const STATUS_META: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string; dot: string }> = {
  published: { icon: <CheckCircle2 className="h-3 w-3" />, label: 'Published', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/30', dot: 'bg-emerald-500' },
  pending:   { icon: <Clock        className="h-3 w-3" />, label: 'Pending',   color: 'text-amber-600  dark:text-amber-400',   bg: 'bg-amber-50  dark:bg-amber-950/40  border-amber-200/60  dark:border-amber-800/30',  dot: 'bg-amber-500'  },
  flagged:   { icon: <AlertTriangle className="h-3 w-3"/>, label: 'Flagged',   color: 'text-orange-600 dark:text-orange-400',  bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200/60 dark:border-orange-800/30', dot: 'bg-orange-500' },
  rejected:  { icon: <XCircle      className="h-3 w-3" />, label: 'Rejected',  color: 'text-red-600    dark:text-red-400',     bg: 'bg-red-50    dark:bg-red-950/40    border-red-200/60    dark:border-red-800/30',    dot: 'bg-red-500'    },
};

const STAT_CARDS = [
  { key: 'totalReviews',     label: 'Total Reviews',  sub: (ov: any) => `+${ov.reviewsThisMonth} this month`,  icon: <BookOpen  className="h-5 w-5" />, from: '#059669', to: '#047857', glow: '0 12px 40px rgba(5,150,105,0.4)'   },
  { key: 'publishedReviews', label: 'Published',      sub: (ov: any) => ov.totalReviews > 0 ? `${Math.round((ov.publishedReviews/ov.totalReviews)*100)}% approval` : 'No reviews', icon: <CheckCircle2 className="h-5 w-5" />, from: '#2563eb', to: '#1d4ed8', glow: '0 12px 40px rgba(37,99,235,0.4)'  },
  { key: 'totalHelpfulVotes',label: 'Helpful Votes',  sub: () => 'community validated',                        icon: <ThumbsUp  className="h-5 w-5" />, from: '#7c3aed', to: '#6d28d9', glow: '0 12px 40px rgba(124,58,237,0.4)' },
  { key: 'averageRating',    label: 'Avg Rating',     sub: (ov: any) => ov.publishedReviews > 0 ? `${ov.publishedReviews} reviews` : 'no reviews', icon: <Star className="h-5 w-5" />, from: '#d97706', to: '#b45309', glow: '0 12px 40px rgba(217,119,6,0.4)', decimals: 1 },
];

const STATUS_DETAILS = {
  published: { hex:'#10b981', label:'Published', desc:'Live and visible to all shoppers.', icon:<CheckCircle2 className="h-3.5 w-3.5"/>, bg:'bg-emerald-50 dark:bg-emerald-950/30', text:'text-emerald-700 dark:text-emerald-400', border:'border-emerald-200/60 dark:border-emerald-800/40' },
  pending:   { hex:'#f59e0b', label:'Pending',   desc:'Awaiting moderator review.',        icon:<Clock        className="h-3.5 w-3.5"/>, bg:'bg-amber-50  dark:bg-amber-950/30',   text:'text-amber-700  dark:text-amber-400',   border:'border-amber-200/60  dark:border-amber-800/40'  },
  flagged:   { hex:'#f97316', label:'Flagged',   desc:'Marked for closer review.',         icon:<AlertTriangle className="h-3.5 w-3.5"/>, bg:'bg-orange-50 dark:bg-orange-950/30',text:'text-orange-700 dark:text-orange-400',  border:'border-orange-200/60 dark:border-orange-800/40' },
  rejected:  { hex:'#ef4444', label:'Rejected',  desc:"Didn't meet guidelines.",           icon:<XCircle      className="h-3.5 w-3.5"/>, bg:'bg-red-50    dark:bg-red-950/30',    text:'text-red-700    dark:text-red-400',     border:'border-red-200/60    dark:border-red-800/40'    },
};

/* ── Donut chart ── */
function DonutChart({ segments }: { segments: Array<{ pct: number; color: string }> }) {
  const R = 38; const C = 2 * Math.PI * R; let cum = 0;
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
      <circle cx="50" cy="50" r={R} fill="none" strokeWidth="11" stroke="currentColor" className="text-slate-100 dark:text-white/[0.05]" />
      {segments.filter(s => s.pct > 0).map((seg, i) => {
        const dash = (seg.pct / 100) * C;
        const off  = -(cum / 100) * C;
        cum += seg.pct;
        return <circle key={i} cx="50" cy="50" r={R} fill="none" strokeWidth="11" stroke={seg.color} strokeDasharray={`${dash} ${C}`} strokeDashoffset={off} strokeLinecap="butt" className="transition-all duration-700" />;
      })}
    </svg>
  );
}

export default function DashboardPage() {
  const { user }             = useAuth();
  const [stats, setStats]    = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const reduced              = useReducedMotion();

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    authApi.getMyStats().then((res) => setStats(res.data ?? null)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (!user) return null;
  const ov = stats?.overview;

  const publishedPct = ov?.totalReviews ? Math.round((ov.publishedReviews / ov.totalReviews) * 100) : 0;
  const donutSegments = ov ? [
    { pct: ov.totalReviews > 0 ? (ov.publishedReviews / ov.totalReviews) * 100 : 0, color: '#10b981' },
    { pct: ov.totalReviews > 0 ? (ov.pendingReviews   / ov.totalReviews) * 100 : 0, color: '#f59e0b' },
    { pct: ov.totalReviews > 0 ? (ov.flaggedReviews   / ov.totalReviews) * 100 : 0, color: '#f97316' },
    { pct: ov.totalReviews > 0 ? (ov.rejectedReviews  / ov.totalReviews) * 100 : 0, color: '#ef4444' },
  ] : [];

  return (
    <motion.div
      variants={reduced ? {} : pageTransition}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-slate-50 dark:bg-[#060c1a]"
    >
      {/* ── Hero Header ─────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(140deg, #020917 0%, #040f1f 45%, #061629 100%)' }}>
        {/* Orbs */}
        {!reduced && (
          <>
            <motion.div {...orbFloat(0).animate} className="absolute -top-32 right-0 w-[600px] h-[500px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(5,150,105,0.14) 0%, transparent 70%)' }} />
            <motion.div {...orbFloat(3).animate} className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)' }} />
          </>
        )}
        <div className="absolute inset-0 hero-grid-overlay pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #060c1a, transparent)' }} />

        <div className="relative mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18 py-8 xs:py-10 sm:py-14">
          <motion.div
            variants={reduced ? {} : staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row sm:items-end gap-6 sm:justify-between"
          >
            <div className="flex items-center gap-5">
              <motion.div variants={reduced ? {} : staggerItem} className="relative">
                <div className="h-16 w-16 xs:h-20 xs:w-20 rounded-2xl overflow-hidden ring-2 ring-brand-500/35 ring-offset-2 ring-offset-transparent shadow-2xl shadow-brand-900/50">
                  <Avatar src={user.avatar_url} name={user.full_name || user.username} size="xl" className="h-full w-full" />
                </div>
                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-[#020917] flex items-center justify-center shadow-lg">
                  <span className="h-2 w-2 rounded-full bg-white" />
                </span>
              </motion.div>

              <motion.div variants={reduced ? {} : staggerItem}>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-400/80 mb-0.5">{greeting}</p>
                <h1 className="text-xl xs:text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  {user.full_name || user.username || 'My Dashboard'}
                </h1>
                <div className="flex flex-wrap items-center gap-2.5 mt-2">
                  <span className="text-sm text-slate-400">{user.email}</span>
                  <RoleBadge role={user.role} />
                  {!loading && ov && ov.reviewsThisMonth > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-400 bg-brand-950/60 border border-brand-800/40 px-2 py-0.5 rounded-full">
                      <Sparkles className="h-3 w-3" aria-hidden="true" />
                      {ov.reviewsThisMonth} this month
                    </span>
                  )}
                </div>
              </motion.div>
            </div>

            <motion.div variants={reduced ? {} : staggerItem} className="flex items-center gap-2 flex-wrap">
              <Link href="/products/new">
                <Button size="sm" icon={<Plus className="h-4 w-4" aria-hidden="true" />}
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
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18 -mt-4 pb-12 space-y-6">

        {/* ── Stat Cards ─────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
          </div>
        ) : ov && (
          <motion.div
            variants={reduced ? {} : staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {STAT_CARDS.map((card) => {
              const raw = ov[card.key as keyof typeof ov] as number;
              return (
                <motion.div
                  key={card.key}
                  variants={reduced ? {} : staggerItem}
                  className="relative overflow-hidden rounded-2xl p-5"
                  style={{ background: `linear-gradient(135deg, ${card.from} 0%, ${card.to} 100%)`, boxShadow: card.glow }}
                >
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 pointer-events-none" />
                  <div className="absolute -right-2 top-12 h-14 w-14 rounded-full bg-white/[0.05] pointer-events-none" />
                  <div className="absolute inset-0 card-texture pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-sm">
                        {card.icon}
                      </div>
                      <Zap className="h-3.5 w-3.5 text-white/25" aria-hidden="true" />
                    </div>
                    <AnimatedCounter
                      value={raw}
                      decimals={card.decimals ?? 0}
                      className="text-3xl sm:text-4xl font-black text-white tabular-nums block leading-none"
                    />
                    <p className="text-sm font-bold text-white/85 mt-1.5">{card.label}</p>
                    <p className="text-xs text-white/55 mt-0.5 truncate">{card.sub(ov)}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── Review Health ───────────────────────────────── */}
        {ov && ov.totalReviews > 0 && (
          <motion.div
            variants={reduced ? {} : fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="rounded-2xl border border-slate-200/60 dark:border-white/[0.07] bg-white dark:bg-[#0c1526] shadow-sm overflow-hidden"
          >
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
                  <Activity className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
                <h2 className="font-bold text-slate-900 dark:text-white">Review Health</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">{ov.totalReviews} total</span>
                {publishedPct >= 70 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200/60 dark:border-emerald-800/40">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                    Healthy
                  </span>
                )}
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 shrink-0">
                  <DonutChart segments={donutSegments} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <AnimatedCounter value={publishedPct} suffix="%" className="text-3xl sm:text-4xl font-black tabular-nums text-slate-900 dark:text-white leading-none" />
                    <span className="text-xs font-semibold text-slate-500 mt-1">published</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 flex-1 w-full">
                  {(['published','pending','flagged','rejected'] as const).map((key) => {
                    const d   = STATUS_DETAILS[key];
                    const val = ov[`${key === 'published' ? 'published' : key === 'pending' ? 'pending' : key === 'flagged' ? 'flagged' : 'rejected'}Reviews` as keyof typeof ov] as number;
                    const pct = ov.totalReviews > 0 ? Math.round((val / ov.totalReviews) * 100) : 0;
                    return (
                      <div key={key} className={cn('rounded-xl border p-3.5', d.bg, d.border)}>
                        <div className="flex items-start justify-between mb-2">
                          <div className={cn('flex items-center gap-1.5 text-xs font-bold', d.text)}>{d.icon}{d.label}</div>
                          <div className="text-right leading-none">
                            <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{val}</span>
                            <span className="text-xs text-slate-400 block mt-0.5">{pct}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-200/70 dark:bg-white/10 overflow-hidden mb-2">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: d.hex }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{d.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Recent Reviews ──────────────────────────────── */}
        <motion.div
          variants={reduced ? {} : fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="rounded-2xl border border-slate-200/60 dark:border-white/[0.07] bg-white dark:bg-[#0c1526] shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-white/[0.05]">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-sm">
                <MessageSquare className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-white">Recent Reviews</h2>
            </div>
            <Link href="/my-reviews" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors group">
              View all <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-36" /><Skeleton className="h-3 w-52" /><Skeleton className="h-3 w-28" /></div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              ))}
            </div>
          ) : !stats?.recentReviews.length ? (
            <div className="px-6 py-20 text-center">
              <div className="inline-flex h-20 w-20 rounded-3xl bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-950/60 dark:to-brand-950/20 items-center justify-center mx-auto mb-5">
                <Award className="h-10 w-10 text-brand-400" aria-hidden="true" />
              </div>
              <p className="font-bold text-slate-700 dark:text-slate-300 text-lg mb-1">No reviews yet</p>
              <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">Browse products and share your first experience</p>
              <Link href="/products"><Button size="sm" iconRight={<ArrowRight className="h-4 w-4" />}>Browse Products</Button></Link>
            </div>
          ) : (
            <motion.div variants={reduced ? {} : staggerFast} initial="hidden" animate="visible" className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {stats.recentReviews.map((review) => {
                const img  = review.product?.images?.find(i => i.is_primary) || review.product?.images?.[0];
                const meta = STATUS_META[review.status];
                return (
                  <motion.div key={review.id} variants={reduced ? {} : staggerItem}
                    className="px-5 sm:px-6 py-4 flex items-center gap-4 hover:bg-slate-50/80 dark:hover:bg-white/[0.025] transition-colors group">
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/[0.05] shrink-0 border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
                      {img
                        ? <img src={img.url} alt="" className="h-full w-full object-cover" />
                        : <div className="h-full w-full flex items-center justify-center"><Package className="h-5 w-5 text-slate-400" aria-hidden="true" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      {review.product && (
                        <Link href={`/products/${review.product.slug}`} className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 truncate block transition-colors">
                          {review.product.name}
                        </Link>
                      )}
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">{truncate(review.title, 55)}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <StarRating rating={review.rating} size="xs" />
                        <span className="text-xs text-slate-400">{formatRelativeTime(review.created_at)}</span>
                        {review.helpful_count > 0 && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" aria-hidden="true" /> {review.helpful_count}
                          </span>
                        )}
                      </div>
                    </div>
                    {meta && (
                      <span className={cn('inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border shrink-0', meta.color, meta.bg)}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} aria-hidden="true" />
                        <span className="hidden sm:inline">{meta.label}</span>
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        {/* ── Quick Actions ────────────────────────────────── */}
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-3 px-1">Quick Actions</p>
          <motion.div
            variants={reduced ? {} : staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
          >
            {[
              { href:'/products',     icon:<TrendingUp className="h-5 w-5"/>, title:'Discover Products',  desc:'Browse and review new products', iconBg:'bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400' },
              { href:'/my-reviews',   icon:<BookOpen    className="h-5 w-5"/>, title:'My Reviews',         desc:'Manage all your submitted reviews', iconBg:'bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400' },
              { href:'/products/new', icon:<Plus        className="h-5 w-5"/>, title:'Add a Product',      desc:"Can't find it? Add it yourself", iconBg:'bg-amber-100  dark:bg-amber-950/60  text-amber-600  dark:text-amber-400' },
            ].map((action) => (
              <motion.div key={action.href} variants={reduced ? {} : staggerItem}
                whileHover={reduced ? {} : { y: -3 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              >
                <Link href={action.href}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-white/[0.07] bg-white dark:bg-[#0c1526] p-5 flex items-start gap-4 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/40 transition-all duration-200 block dark:hover:border-white/[0.11]">
                  <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 duration-200', action.iconBg)}>
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{action.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{action.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 self-center group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 to-teal-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}
