'use client';

import { useReducedMotion } from 'framer-motion';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Star, Shield, Zap, Users, TrendingUp,
  CheckCircle, ThumbsUp, Package, Sparkles, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import {
  fadeInUp, fadeIn, staggerContainer, staggerItem,
  slideInLeft, slideInRight, scaleIn, getVariants,
} from '@/lib/animations';

/* ── Types ────────────────────────────────────────────── */
interface StatItem   { value: string; label: string }
interface ReviewData {
  id: string; title: string; body: string; rating: number;
  helpful_count: number; created_at: string;
  user: { username?: string; full_name?: string } | null;
  product: { name?: string; slug?: string; category?: { name?: string } } | null;
}
interface Props {
  statItems: StatItem[];
  recentReviews: ReviewData[];
}

/* ── Feature cards ────────────────────────────────────── */
const FEATURES = [
  { icon: Shield,     title: 'Spam-Free Reviews',      desc: 'Advanced 10-signal detection automatically filters fake, paid, and abusive reviews.',       color: 'from-blue-500 to-indigo-600',   glow: 'rgba(99,102,241,0.25)' },
  { icon: Star,       title: 'Verified Ratings',        desc: 'Helpful votes, rating distribution, and human moderation ensure quality you can trust.',    color: 'from-amber-400 to-orange-500',  glow: 'rgba(245,158,11,0.25)' },
  { icon: Zap,        title: 'Lightning Fast',           desc: 'Server-rendered, edge-cached, and optimised for instant load on any connection.',           color: 'from-brand-500 to-teal-500',    glow: 'rgba(16,185,129,0.25)' },
  { icon: Users,      title: 'Community Moderation',    desc: 'Report suspicious reviews, vote helpful ones up, and keep the ecosystem trustworthy.',      color: 'from-violet-500 to-purple-600', glow: 'rgba(139,92,246,0.25)' },
  { icon: Shield,     title: 'Privacy First',            desc: 'Row-level security and encrypted auth protect your data at every layer of the stack.',      color: 'from-rose-500 to-pink-600',     glow: 'rgba(244,63,94,0.25)'  },
  { icon: TrendingUp, title: 'Detailed Insights',       desc: 'Rating distributions, pros/cons, images, and more give you the complete picture.',          color: 'from-cyan-500 to-sky-600',      glow: 'rgba(14,165,233,0.25)' },
];

/* ── Animated stat number ─────────────────────────────── */
function StatCard({ value, label, delay = 0 }: StatItem & { delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      variants={getVariants(!!reduced, staggerItem)}
      className="flex flex-col"
    >
      <span className="text-2xl xs:text-3xl font-bold text-white tabular-nums">{value}</span>
      <span className="text-xs text-slate-400 mt-0.5">{label}</span>
    </motion.div>
  );
}

/* ── Floating review card ─────────────────────────────── */
function FloatingReviewCard({ review, index }: { review: ReviewData; index: number }) {
  const reduced = useReducedMotion();
  const author  = review.user;
  const product = review.product;
  const initial = (author?.full_name || author?.username || '?')[0].toUpperCase();
  const colors  = ['bg-brand-600', 'bg-violet-600', 'bg-amber-500', 'bg-cyan-600'];
  const color   = colors[index % colors.length];

  return (
    <motion.div
      variants={getVariants(!!reduced, slideInRight)}
      animate={!reduced ? {
        y: [0, index % 2 === 0 ? -8 : 8, 0],
        transition: { duration: 4 + index, repeat: Infinity, ease: 'easeInOut', delay: index * 1.5 },
      } : {}}
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-2xl ${index === 1 ? 'ml-6 mt-4' : ''}`}
      style={{ maxWidth: 280 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          {product?.category?.name && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-950/60 border border-brand-800/40 px-2 py-0.5 rounded-full">
              {product.category.name}
            </span>
          )}
          {product?.name && (
            <p className="mt-1.5 text-sm font-semibold text-white truncate">{product.name}</p>
          )}
        </div>
        <div className="flex gap-0.5 shrink-0 ml-2">
          {Array.from({ length: Math.min(review.rating, 5) }).map((_, j) => (
            <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>
      <p className="text-xs font-medium text-slate-200 mb-1 line-clamp-1">{review.title}</p>
      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{review.body}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-5 w-5 rounded-full ${color} flex items-center justify-center text-white text-[9px] font-bold`}>
            {initial}
          </div>
          <span className="text-[11px] text-slate-400">{author?.full_name || author?.username || 'Reviewer'}</span>
          <span className="text-[11px] text-brand-400 font-semibold">✓ Verified</span>
        </div>
        {review.helpful_count > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <ThumbsUp className="h-2.5 w-2.5" />{review.helpful_count}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main component ────────────────────────────────────── */
export function LandingPageClient({ statItems, recentReviews }: Props) {
  const reduced = useReducedMotion();

  return (
    <div className="flex flex-col overflow-hidden">

      {/* ═══════════════════════════════════════════ HERO */}
      <section
        className="relative min-h-[92vh] flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #020917 0%, #040f1f 40%, #061629 100%)' }}
      >
        {/* Animated ambient orbs */}
        {!reduced && (
          <>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-40 -right-20 w-[600px] h-[600px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(5,150,105,0.2) 0%, transparent 70%)' }}
            />
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute -bottom-32 -left-20 w-[500px] h-[500px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)' }}
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
              className="absolute top-1/3 right-1/3 w-[300px] h-[300px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.12) 0%, transparent 70%)' }}
            />
          </>
        )}

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18 py-20 sm:py-28 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — copy */}
            <motion.div
              variants={getVariants(!!reduced, staggerContainer)}
              initial="hidden"
              animate="visible"
            >
              {/* Badge */}
              <motion.div variants={getVariants(!!reduced, staggerItem)} className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-brand-300 border border-brand-700/50 bg-brand-950/60 backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" />
                  Trusted by real shoppers
                </span>
              </motion.div>

              {/* H1 */}
              <motion.h1
                variants={getVariants(!!reduced, staggerItem)}
                className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white leading-[0.95] mb-6"
              >
                Reviews you can{' '}
                <span
                  className="block"
                  style={{
                    background: 'linear-gradient(135deg, #34d399 0%, #10b981 40%, #059669 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  actually trust.
                </span>
              </motion.h1>

              {/* Body */}
              <motion.p
                variants={getVariants(!!reduced, staggerItem)}
                className="text-base sm:text-lg text-slate-400 leading-relaxed mb-8 max-w-lg"
              >
                Browse verified product reviews from real buyers. Community-moderated,
                spam-filtered, and built so you shop with confidence every single time.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={getVariants(!!reduced, staggerItem)}
                className="flex flex-wrap gap-3 mb-12"
              >
                <Link href="/products">
                  <motion.div whileHover={reduced ? {} : { scale: 1.03 }} whileTap={reduced ? {} : { scale: 0.97 }}>
                    <Button
                      size="lg"
                      iconRight={<ArrowRight className="h-4 w-4" />}
                      className="bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-lg shadow-brand-900/40 font-semibold"
                    >
                      Browse Products
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/register">
                  <motion.div whileHover={reduced ? {} : { scale: 1.03 }} whileTap={reduced ? {} : { scale: 0.97 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/15 text-white hover:bg-white/10 hover:border-white/25 backdrop-blur-sm font-semibold"
                    >
                      Write a Review
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={getVariants(!!reduced, staggerItem)}
                className="grid grid-cols-2 xs:grid-cols-4 gap-4 pt-8 border-t border-white/[0.08]"
              >
                <motion.div variants={getVariants(!!reduced, staggerContainer)} initial="hidden" animate="visible"
                  className="grid grid-cols-2 xs:grid-cols-4 gap-4 col-span-2 xs:col-span-4">
                  {statItems.map((s, i) => (
                    <StatCard key={s.label} {...s} delay={i * 0.1} />
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right — floating review cards */}
            <motion.div
              variants={getVariants(!!reduced, staggerContainer)}
              initial="hidden"
              animate="visible"
              className="relative hidden lg:flex flex-col gap-4 lg:pl-8"
            >
              {recentReviews.length > 0 ? (
                <>
                  {recentReviews.map((review, i) => (
                    <FloatingReviewCard key={review.id} review={review} index={i} />
                  ))}
                  {/* Trust badge */}
                  <motion.div
                    variants={getVariants(!!reduced, scaleIn)}
                    className="absolute -bottom-6 -left-4 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/8 backdrop-blur-md border border-white/12 shadow-xl"
                  >
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Spam protected</p>
                      <p className="text-[10px] text-slate-400">All reviews moderated</p>
                    </div>
                  </motion.div>
                </>
              ) : (
                /* Placeholder when no reviews yet */
                <motion.div
                  variants={getVariants(!!reduced, scaleIn)}
                  className="rounded-2xl border border-dashed border-white/15 bg-white/4 p-12 text-center backdrop-blur-sm"
                >
                  <Package className="h-12 w-12 text-brand-400 mx-auto mb-4" />
                  <p className="text-sm font-semibold text-slate-300">No reviews yet</p>
                  <p className="text-xs text-slate-500 mt-1">Be the first to review a product</p>
                </motion.div>
              )}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ FEATURES */}
      <section className="bg-slate-50 dark:bg-[#060c1a] py-20 sm:py-28 border-t border-slate-100 dark:border-white/[0.04]">
        <div className="mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18">

          {/* Section label + heading */}
          <motion.div
            variants={getVariants(!!reduced, staggerContainer)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mb-14 text-center"
          >
            <motion.p variants={getVariants(!!reduced, staggerItem)}
              className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400 mb-3">
              Why ReviewHub
            </motion.p>
            <motion.h2 variants={getVariants(!!reduced, staggerItem)}
              className="text-3xl xs:text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
              Built for trust<br className="hidden sm:block" /> from day one.
            </motion.h2>
            <motion.p variants={getVariants(!!reduced, staggerItem)}
              className="text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              Every feature exists to surface authentic opinions and filter noise —
              so every review you read actually matters.
            </motion.p>
          </motion.div>

          {/* Feature grid */}
          <motion.div
            variants={getVariants(!!reduced, staggerContainer)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={getVariants(!!reduced, staggerItem)}
                whileHover={reduced ? {} : { y: -4, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#0c1526] p-6 overflow-hidden cursor-default"
              >
                {/* Gradient glow on hover */}
                {!reduced && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(ellipse at 0% 0%, ${f.glow} 0%, transparent 60%)` }}
                  />
                )}
                {/* Top gradient accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${f.glow.replace('0.25', '0.8')}, transparent)` }}
                />

                <div className="relative">
                  <div
                    className="mb-4 h-11 w-11 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${f.color.replace('from-', '').replace('to-', '').split(' ').map(c => {
                      const map: Record<string, string> = {
                        'blue-500': '#3b82f6', 'indigo-600': '#4f46e5',
                        'amber-400': '#fbbf24', 'orange-500': '#f97316',
                        'brand-500': '#10b981', 'teal-500': '#14b8a6',
                        'violet-500': '#8b5cf6', 'purple-600': '#9333ea',
                        'rose-500': '#f43f5e', 'pink-600': '#db2777',
                        'cyan-500': '#06b6d4', 'sky-600': '#0284c7',
                      };
                      return map[c] || '#10b981';
                    }).join(', ')})` }}
                  >
                    <f.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ CTA */}
      <section
        className="relative overflow-hidden py-20 sm:py-28"
        style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)' }}
      >
        {!reduced && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full border border-white/10 pointer-events-none"
          />
        )}
        <div className="relative mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18 text-center">
          <motion.div
            variants={getVariants(!!reduced, staggerContainer)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.p variants={getVariants(!!reduced, staggerItem)}
              className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200 mb-4">
              Join the community
            </motion.p>
            <motion.h2 variants={getVariants(!!reduced, staggerItem)}
              className="text-3xl xs:text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
              Ready to share your experience?
            </motion.h2>
            <motion.p variants={getVariants(!!reduced, staggerItem)}
              className="text-base text-emerald-100 mb-10 max-w-lg mx-auto">
              Join reviewers helping others make smarter decisions every day.
            </motion.p>
            <motion.div
              variants={getVariants(!!reduced, staggerItem)}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link href="/register">
                <motion.div whileHover={reduced ? {} : { scale: 1.04 }} whileTap={reduced ? {} : { scale: 0.97 }}>
                  <Button
                    size="lg"
                    iconRight={<ArrowRight className="h-4 w-4" />}
                    className="bg-white text-brand-700 hover:bg-emerald-50 font-bold shadow-xl"
                  >
                    Get Started Free
                  </Button>
                </motion.div>
              </Link>
              <Link href="/products">
                <motion.div whileHover={reduced ? {} : { scale: 1.04 }} whileTap={reduced ? {} : { scale: 0.97 }}>
                  <Button
                    size="lg"
                    className="bg-white/10 text-white hover:bg-white/20 border border-white/20 font-semibold backdrop-blur-sm"
                  >
                    Browse Reviews
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
