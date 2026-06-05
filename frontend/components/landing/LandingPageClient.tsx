'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, Star, Shield, Zap, Users, TrendingUp,
  CheckCircle, ThumbsUp, Sparkles, Package,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem, staggerFast, staggerSlow, orbFloat } from '@/lib/animations';

interface Props {
  statItems:     { value: string; label: string }[];
  recentReviews: any[];
}

const FEATURES = [
  { icon: Shield,     title: 'Spam-free Reviews',    desc: 'Advanced heuristic detection filters fake and abusive reviews automatically.',    grad: 'from-blue-500 to-indigo-600',   bg: 'bg-blue-50   dark:bg-blue-950/30',   text: 'text-blue-600   dark:text-blue-400'   },
  { icon: Star,       title: 'Verified Ratings',      desc: 'Rating distribution and helpful votes ensure quality influences every score.',    grad: 'from-amber-500 to-orange-500',  bg: 'bg-amber-50  dark:bg-amber-950/30',  text: 'text-amber-600  dark:text-amber-400'  },
  { icon: Zap,        title: 'Lightning Fast',         desc: 'Server-side rendering and edge caching keep every page blazing fast.',           grad: 'from-brand-500 to-teal-500',    bg: 'bg-brand-50  dark:bg-brand-950/30',  text: 'text-brand-600  dark:text-brand-400'  },
  { icon: Users,      title: 'Community Moderation',   desc: 'Report suspicious reviews and vote helpful ones up — together.',                 grad: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-600 dark:text-violet-400' },
  { icon: Shield,     title: 'Privacy First',          desc: 'Row-level security and secure auth protect every layer of your data.',           grad: 'from-rose-500 to-red-600',      bg: 'bg-rose-50   dark:bg-rose-950/30',   text: 'text-rose-600   dark:text-rose-400'   },
  { icon: TrendingUp, title: 'Detailed Insights',      desc: 'Pros/cons, images, and rating distributions give you the full picture.',         grad: 'from-cyan-500 to-sky-600',      bg: 'bg-cyan-50   dark:bg-cyan-950/30',   text: 'text-cyan-600   dark:text-cyan-400'   },
];

const STEPS = [
  { icon: Package,     title: 'Find a Product',    desc: 'Search our growing catalog across every category.' },
  { icon: Star,        title: 'Write Your Review', desc: 'Share your honest experience — rating, pros, cons, photos.'  },
  { icon: CheckCircle, title: 'Help Others Shop',  desc: 'Your review goes live and helps thousands of real shoppers.' },
];

export function LandingPageClient({ statItems, recentReviews }: Props) {
  const reduced = useReducedMotion();

  return (
    <div className="flex flex-col overflow-hidden">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col lg:flex-row min-h-[92vh] overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #030711 0%, #060c1a 40%, #080f20 100%)' }}
      >
        {/* Animated orbs */}
        {!reduced && (
          <>
            <motion.div {...orbFloat(0).animate}
              className="absolute -top-32 left-1/3 w-[700px] h-[600px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.12) 0%, transparent 70%)' }} />
            <motion.div {...orbFloat(3).animate}
              className="absolute top-1/2 -right-24 w-[500px] h-[500px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.10) 0%, transparent 70%)' }} />
            <motion.div {...orbFloat(5).animate}
              className="absolute -bottom-24 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />
          </>
        )}
        <div className="absolute inset-0 hero-grid-overlay pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #060c1a, transparent)' }} />

        {/* Left: copy */}
        <div className="relative flex flex-col justify-center lg:w-[54%] px-6 xs:px-8 sm:px-12 lg:pl-20 xl:pl-28 pt-20 pb-12 lg:py-0">
          <motion.div variants={reduced ? {} : staggerContainer} initial="hidden" animate="visible">
            <motion.div variants={reduced ? {} : staggerItem} className="mb-6">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-400 bg-brand-950/60 border border-brand-800/40 px-3.5 py-1.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" aria-hidden="true" />
                Trusted by real shoppers
              </span>
            </motion.div>

            <motion.h1 variants={reduced ? {} : staggerItem}
              className="text-5xl xs:text-6xl sm:text-7xl font-black tracking-tighter leading-[0.9] text-white mb-6">
              The most trusted<br />
              <span style={{
                background: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>review platform.</span>
            </motion.h1>

            <motion.p variants={reduced ? {} : staggerItem}
              className="text-lg text-slate-400 leading-relaxed max-w-lg mb-10">
              Actually honest. Rigorously verified. Community-built.
              Browse reviews from real buyers and make smarter decisions every time.
            </motion.p>

            <motion.div variants={reduced ? {} : staggerItem} className="flex flex-wrap gap-3 mb-12">
              <Link href="/products">
                <Button size="lg" iconRight={<ArrowRight className="h-4 w-4" />}
                  className="h-12 px-6 text-base font-bold shadow-xl shadow-brand-900/40">
                  Browse Products
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline"
                  className="h-12 px-6 text-base font-bold border-white/15 text-white hover:bg-white/[0.07] hover:border-white/25">
                  Write a Review
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={reduced ? {} : staggerItem}
              className="grid grid-cols-2 xs:grid-cols-4 gap-4 xs:gap-6 pt-8 border-t border-white/[0.07]">
              {statItems.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl xs:text-3xl font-black text-white tabular-nums">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Right: floating review cards */}
        <div className="relative lg:w-[46%] flex items-center justify-center px-6 pb-16 lg:py-0">
          <motion.div
            initial={reduced ? {} : { opacity: 0, x: 40 }}
            animate={reduced ? {} : { opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-sm relative"
          >
            {recentReviews.length > 0 ? (
              <div className="space-y-4">
                {recentReviews.map((review: any, i: number) => {
                  const author  = review.user as { username?: string; full_name?: string } | null;
                  const product = review.product as { name?: string; category?: { name?: string } } | null;
                  const initial = (author?.full_name || author?.username || '?')[0].toUpperCase();
                  const colors  = ['bg-brand-600','bg-violet-600','bg-amber-500','bg-pink-600'];

                  return (
                    <motion.div key={review.id}
                      initial={reduced ? {} : { opacity: 0, y: 20 }}
                      animate={reduced ? {} : { opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 + i * 0.12, duration: 0.45 }}
                      whileHover={reduced ? {} : { y: -3 }}
                      className={cn('glass-dark rounded-2xl p-5', i === 1 ? 'lg:ml-8' : '')}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          {product?.category?.name && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-950/60 border border-brand-800/40 px-2 py-0.5 rounded-full">{product.category.name}</span>
                          )}
                          {product?.name && <p className="mt-1.5 text-sm font-bold text-white truncate max-w-[180px]">{product.name}</p>}
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          {Array.from({ length: Math.min(review.rating, 5) }).map((_: unknown, j: number) => (
                            <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-slate-200 mb-1 line-clamp-1">{review.title}</p>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{review.body}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className={cn('h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0', colors[i % colors.length])} aria-hidden="true">
                          {initial}
                        </div>
                        <span className="text-xs text-slate-400 font-medium">{author?.full_name || author?.username || 'Reviewer'}</span>
                        <span className="text-[10px] font-bold text-brand-400">✓ Verified</span>
                        {review.helpful_count > 0 && (
                          <span className="ml-auto flex items-center gap-1 text-xs text-slate-500">
                            <ThumbsUp className="h-3 w-3" aria-hidden="true" /> {review.helpful_count}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                <motion.div
                  initial={reduced ? {} : { opacity: 0, scale: 0.85 }}
                  animate={reduced ? {} : { opacity: 1, scale: 1 }}
                  transition={{ delay: 0.75, duration: 0.4, ease: [0.34,1.56,0.64,1] }}
                  className="absolute -bottom-4 -left-4 glass-dark rounded-xl px-4 py-2.5 hidden lg:flex items-center gap-2"
                >
                  <div className="h-8 w-8 rounded-lg bg-brand-950/60 border border-brand-800/40 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-brand-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Spam protected</p>
                    <p className="text-[10px] text-slate-500">All reviews moderated</p>
                  </div>
                </motion.div>
              </div>
            ) : (
              <motion.div initial={reduced ? {} : { opacity: 0, y: 20 }} animate={reduced ? {} : { opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="glass-dark rounded-2xl p-10 text-center">
                <Star className="h-10 w-10 text-brand-400 mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm font-bold text-slate-300 mb-1">No reviews yet</p>
                <p className="text-xs text-slate-500 mb-4">Be the first to review a product</p>
                <Link href="/products"><Button size="sm" variant="outline" className="border-white/15 text-white hover:bg-white/[0.07]">Browse Products</Button></Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-[#060c1a] py-20 sm:py-28">
        <div className="mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18">
          <motion.div variants={reduced ? {} : staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            className="mb-14 text-center max-w-xl mx-auto">
            <motion.span variants={reduced ? {} : staggerItem}
              className="inline-block text-[11px] font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400 mb-4">Why ReviewHub</motion.span>
            <motion.h2 variants={reduced ? {} : staggerItem}
              className="text-3xl xs:text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-4">
              Built for trust<br /><span className="text-gradient">from day one.</span>
            </motion.h2>
            <motion.p variants={reduced ? {} : staggerItem} className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
              Every feature surfaces authentic opinions and filters noise.
            </motion.p>
          </motion.div>

          <motion.div variants={reduced ? {} : staggerSlow} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={reduced ? {} : staggerItem}
                whileHover={reduced ? {} : { y: -4 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                className="group relative rounded-2xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#0c1526] p-6 overflow-hidden hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40 transition-shadow duration-300">
                <div className={cn('absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left', f.grad)} />
                <div className={cn('mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl', f.bg)}>
                  <f.icon className={cn('h-6 w-6', f.text)} aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-slate-100">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white dark:bg-[#0c1526] border-y border-slate-200/60 dark:border-white/[0.06]">
        <div className="mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18">
          <motion.div variants={reduced ? {} : staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
            <motion.div variants={reduced ? {} : staggerItem} className="text-center mb-14">
              <span className="inline-block text-[11px] font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400 mb-4">How it works</span>
              <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-white">Start in 60 seconds.</h2>
            </motion.div>
            <div className="grid gap-8 sm:gap-6 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <motion.div key={step.title} variants={reduced ? {} : staggerItem} className="relative text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <div className="relative shrink-0">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-950/60 dark:to-brand-950/30 border border-brand-200/60 dark:border-brand-800/40 flex items-center justify-center shadow-sm">
                        <step.icon className="h-8 w-8 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                      </div>
                      <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-brand-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-[#0c1526]">{i + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #030711 0%, #040f1f 50%, #061629 100%)' }}>
        {!reduced && (
          <motion.div {...orbFloat(2).animate}
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 60% 50%, rgba(16,185,129,0.13) 0%, transparent 65%)' }} />
        )}
        <div className="absolute inset-0 hero-grid-overlay opacity-70 pointer-events-none" />
        <div className="relative mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18 text-center">
          <motion.div variants={reduced ? {} : staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
            <motion.div variants={reduced ? {} : staggerItem} className="mb-4">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-400 bg-brand-950/60 border border-brand-800/40 px-3.5 py-1.5 rounded-full">
                <Sparkles className="h-3 w-3" aria-hidden="true" /> Free forever
              </span>
            </motion.div>
            <motion.h2 variants={reduced ? {} : staggerItem}
              className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-tight mb-5">
              Ready to share your<br /><span className="text-gradient">honest experience?</span>
            </motion.h2>
            <motion.p variants={reduced ? {} : staggerItem}
              className="text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Join thousands of reviewers helping millions of shoppers make smarter decisions.
            </motion.p>
            <motion.div variants={reduced ? {} : staggerItem} className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" iconRight={<ArrowRight className="h-4 w-4" />}
                  className="h-12 px-8 text-base font-bold shadow-xl shadow-brand-900/40">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline"
                  className="h-12 px-8 text-base font-bold border-white/15 text-white hover:bg-white/[0.07] hover:border-white/25">
                  Browse Reviews
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
