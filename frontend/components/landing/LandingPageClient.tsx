'use client';

import Link from 'next/link';
import { ArrowRight, SearchCheck, ShieldCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  statItems: { value: string; label: string }[];
  recentReviews: any[];
}

const categories = ['Electronics', 'Home', 'Beauty', 'Fitness', 'Appliances', 'Travel gear'];

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

export function LandingPageClient({ statItems, recentReviews }: Props) {
  const reviews = (recentReviews?.length ? recentReviews : fallbackReviews).slice(0, 3);

  return (
    <div className="trust-shell">
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:px-20 lg:py-20">
          <div className="max-w-4xl">
            <p className="mb-5 text-label-mono text-[var(--primary)]">Independent product evidence</p>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] text-[var(--foreground)] sm:text-6xl lg:text-7xl">
              Reviews you can verify before you buy.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              ReviewHub organizes buyer reviews around proof, moderation history, rating quality, and product context so decisions feel slower, clearer, and less manipulated.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/products">
                <Button size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>Compare products</Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline">Write a review</Button>
              </Link>
            </div>
            <div className="mt-12 grid max-w-3xl grid-cols-2 border-y border-[var(--border)] sm:grid-cols-4">
              {statItems.map((item) => (
                <div key={item.label} className="border-r border-[var(--border)] px-4 py-5 last:border-r-0 first:pl-0">
                  <p className="text-2xl font-black tabular-nums text-[var(--foreground)]">{item.value}</p>
                  <p className="mt-1 text-xs font-bold text-[var(--muted)]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] p-5">
              <p className="text-label-mono text-[var(--primary)]">Search the evidence</p>
              <div className="mt-4 flex items-center gap-3 border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-bold text-[var(--muted)]">
                <SearchCheck className="h-5 w-5 shrink-0 text-[var(--primary)]" />
                <span className="truncate">Search products, brands, or categories</span>
              </div>
            </div>

            <div className="border-b border-[var(--border)] p-5">
              <p className="text-sm font-black text-[var(--foreground)]">Popular categories</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <Link
                    key={category}
                    href={`/products?category=${encodeURIComponent(category)}`}
                    className="border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-extrabold text-[var(--foreground)] hover:border-[var(--primary)]"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-[var(--foreground)]">Recent reviews</p>
                <Link href="/products" className="text-xs font-black text-[var(--primary)]">See all</Link>
              </div>
              <div className="mt-4 divide-y divide-[var(--border)]">
                {reviews.map((item, index) => {
                  const author = item.user?.full_name || item.user?.username || item.author || 'Verified buyer';
                  const product = item.product?.name || (typeof item.product === 'string' ? item.product : 'Reviewed product');
                  const rating = Math.max(0, Math.min(5, Math.round(Number(item.rating) || 5)));
                  return (
                    <article key={`${item.title || product}-${index}`} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-3">
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
                      <p className="mt-1 text-xs font-bold text-[var(--muted)]">{product}</p>
                      <p className="mt-2 text-sm font-black text-[var(--foreground)]">{item.title || 'Recent review'}</p>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                        {item.body || item.text || 'A verified buyer shared enough detail to make the product easier to judge.'}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1600px] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-20">
        <div>
          <p className="text-label-mono text-[var(--primary)]">How ReviewHub reads a product</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-[var(--foreground)] sm:text-4xl">A rating is only useful when the evidence behind it is visible.</h2>
        </div>
        <div className="grid gap-0 border-y border-[var(--border)]">
          {[
            ['Verification', 'Reviews are separated by purchase evidence, account history, and moderation state.'],
            ['Rating quality', 'A five-star average is weighed against volume, recency, helpfulness, and review detail.'],
            ['Abuse handling', 'Reports, flags, and moderation queues are part of the product record, not hidden operations.'],
          ].map(([title, text]) => (
            <div key={title} className="grid gap-3 border-b border-[var(--border)] py-5 last:border-b-0 sm:grid-cols-[180px_1fr]">
              <p className="flex items-center gap-2 text-sm font-black text-[var(--foreground)]">
                <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
                {title}
              </p>
              <p className="text-sm leading-7 text-[var(--muted)]">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
