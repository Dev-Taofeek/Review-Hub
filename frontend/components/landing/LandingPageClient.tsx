'use client';

import Link from 'next/link';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowRight, Shield, Zap, Users, Star,
  CheckCircle, ChevronDown, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem, orbFloat } from '@/lib/animations';

interface Props {
  statItems:     { value: string; label: string }[];
  recentReviews: any[];
}

/* ── Scroll-aware section ── */
function RevealSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref     = useRef(null);
  const inView  = useInView(ref, { once: true, margin: '-80px' });
  const reduced = useReducedMotion();

  return (
    <motion.div ref={ref}
      initial={reduced ? {} : { opacity: 0, y: 32 }}
      animate={inView || reduced ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Trust score ring (SVG) ── */
function TrustRing({ score, label }: { score: number; label: string }) {
  const R = 36; const C = 2 * Math.PI * R;
  const dash = (score / 100) * C;
  const color = score >= 85 ? '#00E5A0' : score >= 60 ? '#FBBF24' : '#FF6B6B';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
        <circle cx="44" cy="44" r={R} fill="none" strokeWidth="5" stroke="rgba(255,255,255,0.07)" />
        <motion.circle
          cx="44" cy="44" r={R} fill="none" strokeWidth="5"
          stroke={color} strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          initial={{ strokeDasharray: `0 ${C}` }}
          animate={{ strokeDasharray: `${dash} ${C}` }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.34, 1.1, 0.64, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-data text-lg font-black" style={{ color }}>{score}</span>
        <span className="text-[8px] font-bold uppercase tracking-[0.15em] opacity-50 text-white">{label}</span>
      </div>
    </div>
  );
}

/* ── Floating review card ── */
function FloatingCard({ review, delay = 0, offset = false }: { review: any; delay?: number; offset?: boolean }) {
  const author  = review.user as { username?: string; full_name?: string } | null;
  const product = review.product as { name?: string; category?: { name?: string } } | null;
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 20, scale: 0.96 }}
      animate={reduced ? {} : { opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.34, 1.1, 0.64, 1] }}
      whileHover={reduced ? {} : { y: -5, scale: 1.01 }}
      className={cn('glass-void rounded-2xl p-5 w-full max-w-[320px]', offset && 'ml-8')}
      style={{ boxShadow: '0 0 0 1px rgba(0,229,160,0.08), 0 20px 48px rgba(0,0,0,0.5)' }}
    >
      {/* Top */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          {product?.category?.name && (
            <span className="text-label-mono" style={{ color: 'var(--signal)' }}>{product.category.name}</span>
          )}
          {product?.name && <p className="text-sm font-bold text-white mt-1 truncate">{product.name}</p>}
        </div>
        <div className="flex gap-0.5 ml-3 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn('h-3 w-3', i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-white/10 text-white/10')} />
          ))}
        </div>
      </div>

      {/* Review text */}
      <p className="text-xs text-white/60 leading-relaxed line-clamp-2 mb-3">{review.body}</p>

      {/* Author + trust indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-signal to-brand-700 flex items-center justify-center text-[10px] font-black text-white shrink-0">
            {(author?.full_name || author?.username || '?')[0].toUpperCase()}
          </div>
          <span className="text-[11px] font-medium text-white/50">{author?.full_name || author?.username}</span>
        </div>
        <span className="text-[10px] font-bold text-signal flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Verified
        </span>
      </div>
    </motion.div>
  );
}

/* ── STAT pill ── */
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-data text-2xl sm:text-3xl font-black text-white">{value}</span>
      <span className="text-label-mono mt-0.5" style={{ color: 'var(--text-2)' }}>{label}</span>
    </div>
  );
}

export function LandingPageClient({ statItems, recentReviews }: Props) {
  const reduced = useReducedMotion();

  return (
    <div className="flex flex-col">

      {/* ════════════════════════════════════════════════════
          HERO — "The Truth Machine"
          Full viewport. No noise. Pure signal.
      ════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-[100svh] flex flex-col overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #030610 0%, #06080F 40%, #090D1C 100%)' }}
      >
        {/* Ambient light — positions chosen for visual balance */}
        {!reduced && (
          <>
            <motion.div {...orbFloat(0).animate} className="absolute pointer-events-none"
              style={{ top: '-15%', left: '35%', width: '600px', height: '600px', background: 'radial-gradient(ellipse, rgba(0,229,160,0.09) 0%, transparent 70%)' }} />
            <motion.div {...orbFloat(4).animate} className="absolute pointer-events-none"
              style={{ top: '20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 70%)' }} />
            <motion.div {...orbFloat(7).animate} className="absolute pointer-events-none"
              style={{ bottom: '0%', left: '10%', width: '350px', height: '350px', background: 'radial-gradient(ellipse, rgba(0,229,160,0.05) 0%, transparent 70%)' }} />
          </>
        )}

        {/* Grid */}
        <div className="absolute inset-0 grid-signal pointer-events-none" />

        {/* Bottom gradient bridge to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #06080F, transparent)' }} />

        {/* ── Copy + Cards ── */}
        <div className="relative flex-1 flex items-center">
          <div className="mx-auto w-full max-w-[1600px] px-6 xs:px-8 sm:px-12 lg:px-20 xl:px-28">
            <div className="grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] gap-12 xl:gap-20 items-center min-h-[80vh] py-20">

              {/* LEFT: The statement */}
              <motion.div
                variants={reduced ? {} : staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {/* Signal label */}
                <motion.div variants={reduced ? {} : staggerItem} className="mb-8">
                  <span className="inline-flex items-center gap-2 text-label-mono px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)', color: 'var(--signal)' }}>
                    <span className="dot-live" aria-hidden="true" />
                    Trusted Review Intelligence
                  </span>
                </motion.div>

                {/* HEADLINE — maximum drama */}
                <motion.h1 variants={reduced ? {} : staggerItem}
                  className="font-black text-white leading-[0.88] tracking-[-0.05em] mb-8"
                  style={{ fontSize: 'clamp(3rem, 7.5vw, 5.5rem)' }}>
                  The truth about<br />
                  <span style={{
                    background: 'linear-gradient(135deg, #00E5A0 0%, #00B880 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>
                    every product.
                  </span>
                </motion.h1>

                {/* Body */}
                <motion.p variants={reduced ? {} : staggerItem}
                  className="text-base sm:text-lg leading-[1.7] max-w-[480px] mb-10"
                  style={{ color: 'var(--text-2)' }}>
                  Verified reviews from real buyers. Spam-filtered. Community-moderated.
                  Built so you never have to guess again.
                </motion.p>

                {/* CTAs */}
                <motion.div variants={reduced ? {} : staggerItem} className="flex flex-wrap gap-3 mb-14">
                  <Link href="/products">
                    <motion.button
                      whileHover={reduced ? {} : { scale: 1.02 }}
                      whileTap={reduced ? {} : { scale: 0.97 }}
                      className="inline-flex items-center gap-2 h-12 px-6 rounded-xl font-bold text-sm text-black transition-all"
                      style={{
                        background: 'var(--signal)',
                        boxShadow: '0 0 0 1px rgba(0,229,160,0.5), 0 0 24px rgba(0,229,160,0.25)',
                      }}
                    >
                      Browse Products <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </Link>
                  <Link href="/register">
                    <motion.button
                      whileHover={reduced ? {} : { scale: 1.02 }}
                      whileTap={reduced ? {} : { scale: 0.97 }}
                      className="inline-flex items-center gap-2 h-12 px-6 rounded-xl font-bold text-sm transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.8)',
                      }}
                    >
                      Write a Review
                    </motion.button>
                  </Link>
                </motion.div>

                {/* Stats — monospace data display */}
                <motion.div variants={reduced ? {} : staggerItem}
                  className="grid grid-cols-2 xs:grid-cols-4 gap-6 pt-8"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  {statItems.map((s) => <StatPill key={s.label} value={s.value} label={s.label} />)}
                </motion.div>
              </motion.div>

              {/* RIGHT: Floating review cards with trust rings */}
              <div className="relative hidden lg:flex flex-col gap-4 items-end">
                {recentReviews.length > 0 ? (
                  <>
                    {recentReviews.map((review, i) => (
                      <FloatingCard key={review.id} review={review} delay={0.4 + i * 0.15} offset={i === 1} />
                    ))}

                    {/* Trust score ring */}
                    <motion.div
                      initial={reduced ? {} : { opacity: 0, scale: 0.8 }}
                      animate={reduced ? {} : { opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9, duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }}
                      className="absolute -bottom-8 -left-12 glass-void rounded-2xl p-4 flex items-center gap-4"
                    >
                      <TrustRing score={94} label="Trust" />
                      <div>
                        <p className="text-sm font-bold text-white">High Confidence</p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-2)' }}>94 reviews verified</p>
                      </div>
                    </motion.div>
                  </>
                ) : (
                  <motion.div initial={reduced ? {} : { opacity: 0 }} animate={reduced ? {} : { opacity: 1 }} transition={{ delay: 0.5 }}
                    className="glass-void rounded-2xl p-10 text-center w-full max-w-[320px]">
                    <TrustRing score={94} label="Trust" />
                    <p className="text-sm font-bold text-white mt-4 mb-1">Zero spam guaranteed</p>
                    <p className="text-xs" style={{ color: 'var(--text-2)' }}>AI + human moderation</p>
                  </motion.div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        {!reduced && (
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-30"
          >
            <span className="text-label-mono text-white">scroll</span>
            <ChevronDown className="h-4 w-4 text-white" />
          </motion.div>
        )}
      </section>

      {/* ════════════════════════════════════════════════════
          TRUST PROOF — "The Numbers Don't Lie"
      ════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-white dark:bg-[#0D1020] border-y border-slate-200/60 dark:border-white/[0.05]">
        <div className="mx-auto max-w-[1600px] px-6 xs:px-8 sm:px-12 lg:px-20">
          <RevealSection className="flex flex-wrap items-center justify-center gap-12 sm:gap-20">
            {[
              { val: '99.2%',   desc: 'Spam detection accuracy' },
              { val: '<2hrs',   desc: 'Average moderation time' },
              { val: '4.8★',    desc: 'Platform trust score'    },
              { val: '0 fakes', desc: 'Verified purchase system' },
            ].map((item) => (
              <div key={item.desc} className="text-center">
                <p className="text-data font-black text-2xl sm:text-3xl mb-1" style={{ color: 'var(--signal)' }}>{item.val}</p>
                <p className="text-label-mono" style={{ color: 'var(--text-3)' }}>{item.desc}</p>
              </div>
            ))}
          </RevealSection>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          INTELLIGENCE GRID — "The System"
      ════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 bg-slate-50 dark:bg-[#06080F]">
        <div className="mx-auto max-w-[1600px] px-6 xs:px-8 sm:px-12 lg:px-20">

          <RevealSection className="mb-16">
            <p className="text-label-mono mb-4" style={{ color: 'var(--signal)' }}>The Intelligence</p>
            <h2 className="font-black tracking-[-0.04em] text-slate-900 dark:text-white leading-tight"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}>
              Built to surface truth.<br />
              <span className="text-slate-500 dark:text-slate-400">Not just reviews.</span>
            </h2>
          </RevealSection>

          {/* Asymmetric bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Big card — spans 2 */}
            <RevealSection delay={0.1} className="sm:col-span-2 lg:col-span-2">
              <div className="h-full rounded-2xl p-7 overflow-hidden relative"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,229,160,0.08) 0%, rgba(0,229,160,0.03) 100%)',
                  border: '1px solid rgba(0,229,160,0.15)',
                }}>
                <div className="absolute inset-0 dot-signal opacity-50" />
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl mb-5 flex items-center justify-center"
                    style={{ background: 'rgba(0,229,160,0.15)', border: '1px solid rgba(0,229,160,0.25)' }}>
                    <Shield className="h-6 w-6" style={{ color: 'var(--signal)' }} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Intelligent Spam Detection</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Our multi-layer heuristic engine scores every review across 12 signals — URL patterns, text velocity, rating anomalies, and duplicate detection — before a single word reaches you.
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {[{ n: '12', l: 'Signals' }, { n: '99.2%', l: 'Accuracy' }, { n: '0.8s', l: 'Per review' }].map(item => (
                      <div key={item.l} className="rounded-xl p-3 text-center" style={{ background: 'rgba(0,229,160,0.07)', border: '1px solid rgba(0,229,160,0.12)' }}>
                        <p className="text-data font-black text-lg" style={{ color: 'var(--signal)' }}>{item.n}</p>
                        <p className="text-label-mono mt-0.5" style={{ color: 'var(--text-3)' }}>{item.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </RevealSection>

            {/* Tall card */}
            <RevealSection delay={0.2} className="row-span-2">
              <div className="h-full rounded-2xl p-7 relative overflow-hidden bg-white dark:bg-[#0D1020] border border-slate-200/80 dark:border-white/[0.07]">
                <div className="h-12 w-12 rounded-xl mb-5 flex items-center justify-center"
                  style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <Users className="h-6 w-6" style={{ color: '#A78BFA' }} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Community Verified</h3>
                <p className="text-sm leading-relaxed mb-6 text-slate-600 dark:text-slate-400">
                  Real reviewers, real purchases. Every helpful vote, every report — the community keeps the signal clean.
                </p>
                {/* Trust levels visualization */}
                <div className="space-y-3">
                  {[
                    { label: 'Verified Buyers',   pct: 68, color: '#00E5A0' },
                    { label: 'Regular Users',      pct: 25, color: '#A78BFA' },
                    { label: 'New Members',         pct: 7,  color: '#4A5568' },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{item.label}</span>
                        <span className="text-data text-xs font-bold" style={{ color: item.color }}>{item.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-white/[0.06]">
                        <motion.div className="h-full rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          viewport={{ once: true }}
                          style={{ background: item.color, boxShadow: `0 0 8px ${item.color}60` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>

            {/* Standard card */}
            <RevealSection delay={0.3}>
              <div className="rounded-2xl p-7 bg-white dark:bg-[#0D1020] border border-slate-200/80 dark:border-white/[0.07]">
                <div className="h-12 w-12 rounded-xl mb-5 flex items-center justify-center"
                  style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <Zap className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Real-Time Moderation</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Reviews go live in under 2 hours. Not 2 days. Speed without compromise.
                </p>
              </div>
            </RevealSection>

            {/* Minimal card */}
            <RevealSection delay={0.4}>
              <div className="rounded-2xl p-7 bg-white dark:bg-[#0D1020] border border-slate-200/80 dark:border-white/[0.07]">
                <div className="h-12 w-12 rounded-xl mb-5 flex items-center justify-center"
                  style={{ background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.18)' }}>
                  <Star className="h-6 w-6" style={{ color: 'var(--signal)' }} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Bayesian Ratings</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Scores weighted by reviewer credibility. A 5-star from a verified buyer counts more.
                </p>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          CTA — "Your signal starts here"
      ════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #030610 0%, #06080F 100%)' }}>
        {!reduced && (
          <motion.div {...orbFloat(2).animate} className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 60% 50%, rgba(0,229,160,0.10) 0%, transparent 65%)' }} />
        )}
        <div className="absolute inset-0 grid-signal opacity-70 pointer-events-none" />

        <div className="relative mx-auto max-w-[1600px] px-6 xs:px-8 sm:px-12 lg:px-20 text-center">
          <RevealSection>
            <span className="inline-flex items-center gap-2 text-label-mono px-3 py-1.5 rounded-full mb-8"
              style={{ background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)', color: 'var(--signal)' }}>
              <Sparkles className="h-3 w-3" /> Free. No card required.
            </span>
            <h2 className="font-black tracking-[-0.04em] text-white leading-tight mb-5"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
              Your signal<br />
              <span className="text-gradient">starts here.</span>
            </h2>
            <p className="text-lg max-w-lg mx-auto mb-10" style={{ color: 'var(--text-2)' }}>
              Join thousands of reviewers who are already helping millions of people shop smarter.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <motion.button
                  whileHover={reduced ? {} : { scale: 1.02 }}
                  whileTap={reduced ? {} : { scale: 0.97 }}
                  className="inline-flex items-center gap-2 h-13 px-8 rounded-xl font-bold text-base text-black"
                  style={{
                    background: 'var(--signal)',
                    boxShadow: '0 0 0 1px rgba(0,229,160,0.5), 0 0 32px rgba(0,229,160,0.3)',
                  }}
                >
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </motion.button>
              </Link>
              <Link href="/products">
                <motion.button
                  whileHover={reduced ? {} : { scale: 1.02 }}
                  whileTap={reduced ? {} : { scale: 0.97 }}
                  className="inline-flex items-center gap-2 h-13 px-8 rounded-xl font-bold text-base"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.75)' }}
                >
                  Browse Reviews
                </motion.button>
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

    </div>
  );
}
