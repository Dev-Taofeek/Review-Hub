'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, BadgeCheck, Flag, Gauge, MessageSquareWarning,
  SearchCheck, ShieldCheck, Sparkles, Star, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface Props {
  statItems: { value: string; label: string }[];
  recentReviews: any[];
}

const distribution = [
  { label: '5', value: 72 },
  { label: '4', value: 18 },
  { label: '3', value: 7 },
  { label: '2', value: 2 },
  { label: '1', value: 1 },
];

function TrustRing({ score }: { score: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 104 104" className="-rotate-90">
        <circle cx="52" cy="52" r={r} fill="none" stroke="rgba(247,242,232,.12)" strokeWidth="8" />
        <motion.circle
          cx="52"
          cy="52"
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeLinecap="round"
          strokeWidth="8"
          strokeDasharray={`${(score / 100) * c} ${c}`}
          initial={{ strokeDasharray: `0 ${c}` }}
          animate={{ strokeDasharray: `${(score / 100) * c} ${c}` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-data text-3xl font-black">{score}</span>
        <span className="text-label-mono text-[9px] text-[var(--muted)]">Trust</span>
      </div>
    </div>
  );
}

export function LandingPageClient({ statItems, recentReviews }: Props) {
  const reduced = useReducedMotion();
  const review = recentReviews[0];

  return (
    <div className="trust-shell">
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="absolute inset-0 signal-grid opacity-60" />
        <div className="relative mx-auto grid min-h-[calc(100vh-48px)] max-w-[1600px] grid-cols-1 gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1.02fr_.98fr] lg:px-20 lg:py-14">
          <motion.div
            variants={reduced ? {} : staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col justify-center"
          >
            <motion.span variants={reduced ? {} : staggerItem} className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-label-mono text-[var(--primary)]">
              <span className="dot-live" />
              Verified trust + product discovery
            </motion.span>
            <motion.h1 variants={reduced ? {} : staggerItem} className="max-w-3xl text-5xl font-black leading-[1.02] text-[var(--foreground)] sm:text-6xl lg:text-7xl">
              Reviews you can trust.
            </motion.h1>
            <motion.p variants={reduced ? {} : staggerItem} className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              ReviewHub turns verified buyer opinions into clear buying confidence, blending community moderation, abuse detection, and editorial product discovery.
            </motion.p>
            <motion.div variants={reduced ? {} : staggerItem} className="mt-8 flex flex-wrap gap-3">
              <Link href="/products">
                <Button size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>Discover Products</Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline">Write a Review</Button>
              </Link>
            </motion.div>
            <motion.div variants={reduced ? {} : staggerItem} className="mt-10 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-6 sm:grid-cols-4">
              {statItems.map((item) => (
                <div key={item.label}>
                  <p className="text-data text-2xl font-black text-[var(--foreground)]">{item.value}</p>
                  <p className="mt-1 text-label-mono text-[var(--muted)]">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={reduced ? {} : { opacity: 0, x: 32 }}
            animate={reduced ? {} : { opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="flex items-center"
          >
            <div className="review-intel-card relative w-full overflow-hidden rounded-[2rem] p-5 sm:p-7">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[var(--secondary-soft)]" />
              <div className="relative rounded-3xl forest-panel p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-label-mono text-emerald-300">Review Intelligence</p>
                    <h2 className="mt-2 text-2xl font-black text-[#F7F2E8]">Confidence snapshot</h2>
                    <p className="mt-1 text-sm text-[#C8BFAE]">Live quality signals for buyer-safe discovery.</p>
                  </div>
                  <TrustRing score={94} />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    { icon: <BadgeCheck />, label: 'Verified score', value: '91%', color: 'text-emerald-300' },
                    { icon: <ShieldCheck />, label: 'Trust signal', value: 'High', color: 'text-cyan-200' },
                    { icon: <Flag />, label: 'Flagged spam', value: '12', color: 'text-amber-300' },
                    { icon: <Gauge />, label: 'Mod confidence', value: '98%', color: 'text-emerald-300' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                      <div className={cn('mb-3 [&>svg]:h-5 [&>svg]:w-5', item.color)}>{item.icon}</div>
                      <p className="text-data text-2xl font-black text-[#F7F2E8]">{item.value}</p>
                      <p className="mt-1 text-xs font-bold text-[#C8BFAE]">{item.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-[#031A14]/55 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-bold text-[#F7F2E8]">Rating distribution</p>
                    <p className="text-label-mono text-amber-300">Quality weighted</p>
                  </div>
                  <div className="space-y-2.5">
                    {distribution.map((row, index) => (
                      <div key={row.label} className="flex items-center gap-3">
                        <span className="flex w-7 items-center gap-1 text-xs font-bold text-[#F7F2E8]">{row.label}<Star className="h-3 w-3 fill-amber-300 text-amber-300" /></span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            className="h-full rounded-full bg-[var(--secondary)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${row.value}%` }}
                            transition={{ duration: 0.8, delay: 0.15 + index * 0.06 }}
                          />
                        </div>
                        <span className="w-8 text-right text-data text-xs font-bold text-[#C8BFAE]">{row.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <motion.div
                whileHover={reduced ? {} : { y: -4 }}
                className="relative mx-auto -mt-5 max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-[var(--foreground)]">{review?.title || 'Battery matched real-world claims'}</p>
                    <p className="text-xs text-[var(--muted)]">{review?.body || 'Verified buyer review passed quality and duplicate checks.'}</p>
                  </div>
                  <Sparkles className="h-5 w-5 text-[var(--secondary)]" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1600px] gap-4 px-5 py-12 sm:px-8 md:grid-cols-3 lg:px-20">
        {[
          { icon: <SearchCheck />, title: 'Discovery that explains itself', text: 'Product cards carry rating quality, verified buyer ratios, and moderation signals instead of simple star counts.' },
          { icon: <MessageSquareWarning />, title: 'Reviews with human texture', text: 'Pros, cons, helpful votes, and report flows make every opinion feel accountable and useful.' },
          { icon: <ShieldCheck />, title: 'Moderation built into the brand', text: 'Queue priority, audit trails, and abuse indicators make transparency visible, not buried.' },
        ].map((feature) => (
          <motion.div key={feature.title} whileHover={reduced ? {} : { y: -4 }} className="trust-card rounded-2xl p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] [&>svg]:h-5 [&>svg]:w-5">
              {feature.icon}
            </div>
            <h3 className="text-xl font-black text-[var(--foreground)]">{feature.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{feature.text}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
