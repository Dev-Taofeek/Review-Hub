'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, MessageSquareWarning, SearchCheck, ShieldCheck, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface Props {
  statItems: { value: string; label: string }[];
  recentReviews: any[];
}

export function LandingPageClient({ statItems, recentReviews }: Props) {
  const reduced = useReducedMotion();
  const categoryLinks = ['Electronics', 'Home', 'Beauty', 'Fitness', 'Appliances', 'Travel gear'];
  const fallbackReviews = [
    {
      title: 'Clear photos, honest battery notes',
      body: 'The review matched what arrived, including the small downsides I wanted to know before buying.',
      rating: 5,
      user: { full_name: 'Maya R.' },
      product: { name: 'Wireless headphones' },
    },
    {
      title: 'Useful before checkout',
      body: 'The best comments were from verified buyers and helped me compare two similar models quickly.',
      rating: 4,
      user: { full_name: 'Jon A.' },
      product: { name: 'Countertop blender' },
    },
    {
      title: 'No hype, just the details',
      body: 'I could see why people liked it and where it fell short after a few weeks of use.',
      rating: 5,
      user: { full_name: 'Sofia K.' },
      product: { name: 'Running shoes' },
    },
  ];
  const rawReviews = (recentReviews?.length ? recentReviews : fallbackReviews).slice(0, 3);

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
              <div className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl shadow-emerald-900/10">
                <div className="border-b border-[var(--border)] pb-5">
                  <p className="text-label-mono text-[var(--primary)]">Review search</p>
                  <h2 className="mt-2 text-2xl font-black text-[var(--foreground)]">What are you looking for?</h2>
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-bold text-[var(--muted)]">
                    <SearchCheck className="h-5 w-5 shrink-0 text-[var(--primary)]" />
                    <span className="truncate">Search products, brands, or categories</span>
                  </div>
                </div>

                <div className="border-b border-[var(--border)] py-5">
                  <p className="text-sm font-black text-[var(--foreground)]">Popular categories</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categoryLinks.map((category) => (
                      <Link
                        key={category}
                        href={`/products?category=${encodeURIComponent(category)}`}
                        className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-extrabold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-[var(--foreground)]">Recent reviews</p>
                    <Link href="/products" className="text-xs font-black text-[var(--primary)] hover:underline">
                      See all
                    </Link>
                  </div>
                  <div className="mt-3 space-y-3">
                    {rawReviews.map((item, index) => {
                      const author = item.user?.full_name || item.user?.username || item.author || 'Verified buyer';
                      const product = item.product?.name || (typeof item.product === 'string' ? item.product : 'Reviewed product');
                      const rating = Math.max(0, Math.min(5, Math.round(Number(item.rating) || 5)));
                      return (
                        <motion.div
                          key={`${item.title || product}-${index}`}
                          whileHover={reduced ? {} : { y: -2 }}
                          className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-sm font-black text-[var(--primary)]">
                              {String(author).charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <p className="truncate text-sm font-black text-[var(--foreground)]">{author}</p>
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, starIndex) => (
                                    <Star
                                      key={starIndex}
                                      className={`h-3.5 w-3.5 ${starIndex < rating ? 'fill-[var(--secondary)] text-[var(--secondary)]' : 'fill-[var(--border)] text-[var(--border)]'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="mt-1 truncate text-xs font-bold text-[var(--muted)]">{product}</p>
                              <p className="mt-2 text-sm font-black text-[var(--foreground)]">{item.title || 'Recent review'}</p>
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">{item.body || item.text || 'A verified buyer shared enough detail to make the product easier to judge.'}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
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
