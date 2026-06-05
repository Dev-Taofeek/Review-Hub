'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Star, ThumbsUp, BookOpen, Clock, CheckCircle2, AlertTriangle, XCircle,
  TrendingUp, ArrowRight, Package, MessageSquare, BarChart2,
  Plus, Sparkles, Activity, ChevronRight, Zap, Target,
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
import { staggerContainer, staggerItem, orbFloat, pageTransition } from '@/lib/animations';

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

const STATUS_META: Record<string, { icon: React.ReactNode; label: string; accent: string }> = {
  published: { icon: <CheckCircle2 className="h-3 w-3" />, label: 'Published', accent: '#00E5A0' },
  pending:   { icon: <Clock        className="h-3 w-3" />, label: 'Pending',   accent: '#FBBF24' },
  flagged:   { icon: <AlertTriangle className="h-3 w-3"/>, label: 'Flagged',   accent: '#F97316' },
  rejected:  { icon: <XCircle      className="h-3 w-3" />, label: 'Rejected',  accent: '#FF6B6B' },
};

/* ── Trust score arc ── */
function ScoreArc({ score, label, max = 100 }: { score: number; label: string; max?: number }) {
  const pct = (score / max) * 100;
  const R = 52; const C = 2 * Math.PI * R;
  const arc = (pct / 100) * C * 0.75; /* 270° arc */
  const color = pct >= 80 ? '#00E5A0' : pct >= 60 ? '#FBBF24' : '#FF6B6B';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="124" height="124" viewBox="0 0 124 124">
        {/* Track */}
        <circle cx="62" cy="62" r={R} fill="none" strokeWidth="6"
          stroke="rgba(255,255,255,0.06)"
          strokeDasharray={`${C * 0.75} ${C}`}
          strokeDashoffset={C * 0.125}
          strokeLinecap="round"
          transform="rotate(135 62 62)"
        />
        {/* Fill */}
        <motion.circle cx="62" cy="62" r={R} fill="none" strokeWidth="6"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={`0 ${C}`}
          animate={{ strokeDasharray: `${arc} ${C}` }}
          initial={{ strokeDasharray: `0 ${C}` }}
          transition={{ duration: 1.3, delay: 0.3, ease: [0.34, 1.1, 0.64, 1] }}
          strokeDashoffset={C * 0.125}
          transform="rotate(135 62 62)"
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedCounter value={score} className="text-data text-2xl font-black text-slate-900 dark:text-white" />
        <span className="text-label-mono mt-0.5" style={{ color: 'var(--text-3)', fontSize: '9px' }}>{label}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user }              = useAuth();
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const reduced               = useReducedMotion();

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    authApi.getMyStats().then(r => setStats(r.data ?? null)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (!user) return null;
  const ov = stats?.overview;

  const publishedPct = ov?.totalReviews ? Math.round((ov.publishedReviews / ov.totalReviews) * 100) : 0;

  return (
    <motion.div variants={reduced ? {} : pageTransition} initial="hidden" animate="visible"
      className="min-h-screen" style={{ background: 'var(--void)' }}>

      {/* ── Command header ──────────────────────────────── */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #030610 0%, #060810 50%, #08102A 100%)' }}>
        {!reduced && (
          <>
            <motion.div {...orbFloat(0).animate} className="absolute pointer-events-none"
              style={{ top:'-20%', right:'5%', width:'500px', height:'500px', background:'radial-gradient(ellipse, rgba(0,229,160,0.10) 0%, transparent 70%)' }} />
            <motion.div {...orbFloat(5).animate} className="absolute pointer-events-none"
              style={{ bottom:'-10%', left:'15%', width:'350px', height:'350px', background:'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />
          </>
        )}
        <div className="absolute inset-0 grid-signal pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: 'linear-gradient(to top, var(--void), transparent)' }} />

        <div className="relative mx-auto max-w-[1600px] px-4 xs:px-6 sm:px-8 lg:px-20 py-10 sm:py-14">
          <motion.div variants={reduced ? {} : staggerContainer} initial="hidden" animate="visible"
            className="flex flex-col sm:flex-row sm:items-end gap-6 sm:justify-between">

            <div className="flex items-center gap-5">
              <motion.div variants={reduced ? {} : staggerItem} className="relative">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden ring-2 ring-offset-2 ring-offset-transparent"
                  style={{ boxShadow: '0 0 0 2px rgba(0,229,160,0.25), 0 16px 40px rgba(0,0,0,0.5)' }}>
                  <Avatar src={user.avatar_url} name={user.full_name || user.username} size="xl" className="h-full w-full" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 flex items-center justify-center"
                  style={{ background: '#00E5A0', borderColor: '#030610', boxShadow: '0 0 8px rgba(0,229,160,0.5)' }}>
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              </motion.div>

              <motion.div variants={reduced ? {} : staggerItem}>
                <p className="text-label-mono mb-1" style={{ color: 'rgba(0,229,160,0.7)' }}>{greeting}</p>
                <h1 className="font-black text-white tracking-[-0.03em] leading-tight"
                  style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)' }}>
                  {user.full_name || user.username || 'My Dashboard'}
                </h1>
                <div className="flex flex-wrap items-center gap-2.5 mt-2">
                  <span className="text-sm" style={{ color: 'var(--text-2)' }}>{user.email}</span>
                  <RoleBadge role={user.role} />
                  {!loading && ov && ov.reviewsThisMonth > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', color: '#00E5A0' }}>
                      <Sparkles className="h-2.5 w-2.5" /> {ov.reviewsThisMonth} this month
                    </span>
                  )}
                </div>
              </motion.div>
            </div>

            <motion.div variants={reduced ? {} : staggerItem} className="flex items-center gap-2 flex-wrap">
              <Link href="/products/new">
                <Button size="sm" icon={<Plus className="h-4 w-4" />}
                  className="font-bold"
                  style={{ background: 'var(--signal)', color: '#000', boxShadow: '0 0 0 1px rgba(0,229,160,0.4), 0 0 16px rgba(0,229,160,0.2)' }}>
                  Add Product
                </Button>
              </Link>
              <Link href="/profile">
                <button className="h-9 px-3.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                  Edit Profile
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 xs:px-6 sm:px-8 lg:px-20 -mt-4 pb-12 space-y-6">

        {/* ── Intelligence grid ───────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_,i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
        ) : ov && (
          <motion.div variants={reduced ? {} : staggerContainer} initial="hidden" animate="visible"
            className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { key:'totalReviews',     label:'Total Reviews',  sub:`+${ov.reviewsThisMonth} this month`, icon:<BookOpen  className="h-5 w-5"/>, accent:'#00E5A0' },
              { key:'publishedReviews', label:'Published',      sub:`${publishedPct}% approval rate`,     icon:<CheckCircle2 className="h-5 w-5"/>, accent:'#34D399' },
              { key:'totalHelpfulVotes',label:'Helpful Votes',  sub:'community validated',                icon:<ThumbsUp  className="h-5 w-5"/>, accent:'#A78BFA' },
              { key:'averageRating',    label:'Avg Rating',     sub:`${ov.publishedReviews} reviews`,     icon:<Star      className="h-5 w-5"/>, accent:'#FBBF24', dec:1 },
            ].map(card => {
              const raw = ov[card.key as keyof typeof ov] as number;
              return (
                <motion.div key={card.key} variants={reduced ? {} : staggerItem}
                  className="rounded-2xl p-5 relative overflow-hidden bg-white dark:bg-[#0D1020] border border-slate-200/80 dark:border-white/[0.07] shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
                  {/* Accent glow background */}
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
                    style={{ background: `radial-gradient(ellipse, ${card.accent}10 0%, transparent 70%)`, transform:'translate(30%,-30%)' }} />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center"
                        style={{ background: `${card.accent}15`, border: `1px solid ${card.accent}25`, color: card.accent }}>
                        {card.icon}
                      </div>
                      <Zap className="h-3 w-3" style={{ color: `${card.accent}40` }} />
                    </div>
                    <AnimatedCounter value={raw} decimals={(card as any).dec ?? 0}
                      className="text-data text-3xl font-black text-slate-900 dark:text-white block leading-none mb-1.5" />
                    <p className="text-sm font-bold text-slate-700 dark:text-white/80">{card.label}</p>
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-3)' }}>{card.sub}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── Review Intelligence + Activity ─────────── */}
        {ov && ov.totalReviews > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">

            {/* Score arc panel */}
            <motion.div variants={reduced ? {} : staggerItem} initial="hidden" whileInView="visible" viewport={{ once:true }}
              className="rounded-2xl p-6 bg-white dark:bg-[#0D1020] border border-slate-200/80 dark:border-white/[0.07] shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2 mb-5">
                <Target className="h-4 w-4" style={{ color:'var(--signal)' }} />
                <h2 className="font-bold text-slate-900 dark:text-white">Review Health</h2>
                {publishedPct >= 70 && (
                  <span className="ml-auto text-[11px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ background:'rgba(0,229,160,0.1)', border:'1px solid rgba(0,229,160,0.2)', color:'#00E5A0' }}>
                    <span className="dot-live h-1.5 w-1.5" /> Healthy
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center mb-6">
                <ScoreArc score={publishedPct} label="Published" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { key:'publishedReviews', label:'Published', hex:'#00E5A0', val:ov.publishedReviews  },
                  { key:'pendingReviews',   label:'Pending',   hex:'#FBBF24', val:ov.pendingReviews    },
                  { key:'flaggedReviews',   label:'Flagged',   hex:'#F97316', val:ov.flaggedReviews    },
                  { key:'rejectedReviews',  label:'Rejected',  hex:'#FF6B6B', val:ov.rejectedReviews   },
                ].map(item => {
                  const pct = ov.totalReviews > 0 ? Math.round((item.val / ov.totalReviews) * 100) : 0;
                  return (
                    <div key={item.key} className="rounded-xl p-3"
                      style={{ background:`${item.hex}08`, border:`1px solid ${item.hex}18` }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold" style={{ color:item.hex }}>{item.label}</span>
                        <span className="text-data text-sm font-black text-slate-900 dark:text-white">{item.val}</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                        <motion.div className="h-full rounded-full"
                          initial={{ width:0 }}
                          animate={{ width:`${pct}%` }}
                          transition={{ duration:0.7, ease:'easeOut', delay:0.4 }}
                          style={{ background:item.hex, boxShadow:`0 0 6px ${item.hex}60` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent reviews — timeline style */}
            <motion.div variants={reduced ? {} : staggerItem} initial="hidden" whileInView="visible" viewport={{ once:true }}
              className="rounded-2xl overflow-hidden bg-white dark:bg-[#0D1020] border border-slate-200/80 dark:border-white/[0.07] shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.05]">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center"
                    style={{ background:'rgba(167,139,250,0.12)', border:'1px solid rgba(167,139,250,0.2)' }}>
                    <MessageSquare className="h-3.5 w-3.5" style={{ color:'#A78BFA' }} />
                  </div>
                  <h2 className="font-bold text-slate-900 dark:text-white">Recent Reviews</h2>
                </div>
                <Link href="/my-reviews" className="flex items-center gap-1.5 text-xs font-bold transition-colors group"
                  style={{ color:'var(--signal)' }}>
                  View all <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {loading ? (
                <div className="divide-y" style={{ borderColor:'var(--line)' }}>
                  {[...Array(4)].map((_,i) => (
                    <div key={i} className="px-5 py-4 flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2"><Skeleton className="h-3 w-40" /><Skeleton className="h-3 w-56" /></div>
                    </div>
                  ))}
                </div>
              ) : !stats?.recentReviews.length ? (
                <div className="px-6 py-16 text-center">
                  <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background:'rgba(0,229,160,0.08)', border:'1px solid rgba(0,229,160,0.15)' }}>
                    <Star className="h-8 w-8" style={{ color:'var(--signal)' }} />
                  </div>
                  <p className="font-bold text-slate-800 dark:text-white mb-1">No reviews yet</p>
                  <p className="text-sm mb-5" style={{ color:'var(--text-2)' }}>Share your first experience</p>
                  <Link href="/products"><Button size="sm">Browse Products</Button></Link>
                </div>
              ) : (
                <motion.div variants={reduced ? {} : staggerContainer} initial="hidden" animate="visible">
                  {stats.recentReviews.map(review => {
                    const img  = review.product?.images?.find(i => i.is_primary) || review.product?.images?.[0];
                    const meta = STATUS_META[review.status];
                    return (
                      <motion.div key={review.id} variants={reduced ? {} : staggerItem}
                        className="px-5 py-3.5 flex items-center gap-4 transition-colors cursor-pointer border-b border-slate-100 dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                      >
                        <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0"
                          style={{ background:'var(--raised)', border:'1px solid var(--wire)' }}>
                          {img ? <img src={img.url} alt="" className="h-full w-full object-cover" />
                            : <div className="h-full w-full flex items-center justify-center"><Package className="h-4 w-4" style={{ color:'var(--text-3)' }} /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          {review.product && (
                            <Link href={`/products/${review.product.slug}`} className="text-[11px] font-bold block truncate" style={{ color:'var(--signal)' }}>
                              {review.product.name}
                            </Link>
                          )}
                          <p className="text-sm font-semibold text-slate-800 dark:text-white truncate mt-0.5">{truncate(review.title, 50)}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <StarRating rating={review.rating} size="xs" />
                            <span className="text-[11px]" style={{ color:'var(--text-3)' }}>{formatRelativeTime(review.created_at)}</span>
                          </div>
                        </div>
                        {meta && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0"
                            style={{ background:`${meta.accent}12`, border:`1px solid ${meta.accent}22`, color:meta.accent }}>
                            {meta.icon}
                            <span className="hidden sm:inline">{meta.label}</span>
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          </div>
        )}

        {/* ── Quick actions ────────────────────────────── */}
        <div>
          <p className="text-label-mono mb-3 px-1" style={{ color:'var(--text-3)' }}>Quick Actions</p>
          <motion.div variants={reduced ? {} : staggerContainer} initial="hidden" whileInView="visible" viewport={{ once:true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { href:'/products',     icon:<TrendingUp className="h-5 w-5"/>, label:'Discover Products',  sub:'Browse and review products',     accent:'#00E5A0' },
              { href:'/my-reviews',   icon:<BookOpen   className="h-5 w-5"/>, label:'My Reviews',          sub:'Manage your submitted reviews',  accent:'#A78BFA' },
              { href:'/products/new', icon:<Plus       className="h-5 w-5"/>, label:'Add a Product',       sub:"Can't find it? Add it yourself", accent:'#FBBF24' },
            ].map(action => (
              <motion.div key={action.href} variants={reduced ? {} : staggerItem}
                whileHover={reduced ? {} : { y:-3 }}
                transition={{ type:'spring', stiffness:320, damping:24 }}>
                <Link href={action.href}
                  className="group relative rounded-2xl p-5 flex items-start gap-4 transition-all duration-200 block bg-white dark:bg-[#0D1020] border border-slate-200/80 dark:border-white/[0.07] shadow-sm dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${action.accent}30`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = ''; }}
                >
                  <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-200"
                    style={{ background:`${action.accent}12`, border:`1px solid ${action.accent}22`, color:action.accent }}>
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{action.label}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color:'var(--text-2)' }}>{action.sub}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 self-center group-hover:translate-x-0.5 transition-transform" style={{ color:'var(--text-3)' }} />

                  {/* Signal accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl"
                    style={{ background:`linear-gradient(90deg, ${action.accent}, transparent)` }} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}
