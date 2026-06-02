import Link from 'next/link';
import { ArrowRight, Star, Shield, Zap, Users, TrendingUp, CheckCircle, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createSupabaseServer } from '@/lib/supabase-server';

const EMPTY_DATA = {
  stats: { reviews: 0, products: 0, users: 0, avgRating: '0.0' },
  recentReviews: [] as any[],
};

async function getHomepageData() {
  const timeout = new Promise<typeof EMPTY_DATA>((resolve) =>
    setTimeout(() => resolve(EMPTY_DATA), 5000)
  );

  const fetchData = async () => {
    const supabase = await createSupabaseServer();

    const [
      { count: totalReviews },
      { count: totalProducts },
      { count: totalUsers },
      { data: recentReviews },
      { data: ratingData },
    ] = await Promise.all([
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase
        .from('reviews')
        .select(`
          id, title, body, rating, helpful_count, created_at,
          user:profiles(username, full_name),
          product:products(name, slug, category:categories(name))
        `)
        .eq('status', 'published')
        .order('helpful_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(2),
      supabase
        .from('products')
        .select('average_rating')
        .eq('is_active', true)
        .gt('total_reviews', 0),
    ]);

    const avgRating = ratingData && ratingData.length > 0
      ? (ratingData.reduce((sum, p) => sum + Number(p.average_rating), 0) / ratingData.length).toFixed(1)
      : '0.0';

    return {
      stats: {
        reviews:  totalReviews  ?? 0,
        products: totalProducts ?? 0,
        users:    totalUsers    ?? 0,
        avgRating,
      },
      recentReviews: recentReviews ?? [],
    };
  };

  try {
    return await Promise.race([fetchData(), timeout]);
  } catch {
    return EMPTY_DATA;
  }
}

const features = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Spam-free Reviews',
    desc: 'Advanced heuristic detection automatically filters spam, fake, and abusive reviews before they reach you.',
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: 'Verified Ratings',
    desc: 'Rating distribution, helpful votes, and moderation ensure only quality reviews influence scores.',
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Lightning Fast',
    desc: 'Optimized for performance with server-side rendering, lazy loading, and efficient API design.',
    color: 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Community Moderation',
    desc: 'Report suspicious reviews, vote helpful reviews up, and contribute to a trustworthy ecosystem.',
    color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Privacy First',
    desc: 'Row-level security policies and secure authentication protect your data at every layer.',
    color: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: 'Detailed Insights',
    desc: 'Rating distributions, pros/cons, and image uploads give you the full picture before you buy.',
    color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
  },
];

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}K+`;
  return n > 0 ? `${n}+` : '0';
}

export default async function LandingPage() {
  const { stats, recentReviews } = await getHomepageData();

  const statItems = [
    { value: formatCount(stats.reviews), label: 'Verified Reviews' },
    { value: formatCount(stats.products), label: 'Products' },
    { value: stats.avgRating, label: 'Avg Rating' },
    { value: formatCount(stats.users), label: 'Reviewers' },
  ];

  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="relative overflow-hidden bg-white dark:bg-surface-dark">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-[500px] w-[500px] rounded-full bg-brand-50 opacity-60 blur-3xl dark:bg-brand-950/20" />
          <div className="absolute bottom-0 -left-32 h-[400px] w-[400px] rounded-full bg-emerald-50 opacity-40 blur-3xl dark:bg-emerald-950/10" />
        </div>

        <div className="relative mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-14 py-12 sm:py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left: Copy */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-300">
                <CheckCircle className="h-3.5 w-3.5 text-brand-500" />
                Trusted by real shoppers
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.1] tracking-tight text-gray-900 dark:text-white mb-6">
                Make smarter
                <span className="block text-brand-600 dark:text-brand-400"> purchase decisions</span>
                with honest reviews
              </h1>

              <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-lg">
                Browse verified product reviews from real buyers. Community-moderated,
                spam-filtered, and built for trust — so you shop with confidence every time.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link href="/products">
                  <Button size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>
                    Browse Products
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline">
                    Write a Review
                  </Button>
                </Link>
              </div>

              {/* Real stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-gray-100 dark:border-white/10">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Real review cards */}
            <div className="relative lg:pl-8">
              {recentReviews.length > 0 ? (
                <div className="space-y-4">
                  {recentReviews.map((review: any, i: number) => {
                    const author = review.user as { username?: string; full_name?: string } | null;
                    const product = review.product as { name?: string; slug?: string; category?: { name?: string } } | null;
                    const initial = (author?.full_name || author?.username || '?')[0].toUpperCase();
                    const colors = ['bg-brand-600', 'bg-purple-600', 'bg-orange-500', 'bg-teal-600'];
                    const color = colors[i % colors.length];

                    return (
                      <div
                        key={review.id}
                        className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-card dark:bg-surface-dark-muted dark:border-white/10 ${i === 1 ? 'lg:ml-8' : ''}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            {product?.category?.name && (
                              <span className="text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-2 py-0.5 rounded-full">
                                {product.category.name}
                              </span>
                            )}
                            {product?.name && (
                              <p className="mt-1.5 text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">
                                {product.name}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-0.5 shrink-0">
                            {Array.from({ length: Math.min(review.rating, 5) }).map((_: unknown, j: number) => (
                              <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>

                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1 line-clamp-1">
                          {review.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                          {review.body}
                        </p>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-6 w-6 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold`}>
                              {initial}
                            </div>
                            <span className="text-xs text-gray-500">
                              {author?.full_name || author?.username || 'Reviewer'}
                            </span>
                            <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">✓ Verified</span>
                          </div>
                          {review.helpful_count > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <ThumbsUp className="h-3 w-3" />
                              {review.helpful_count}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <div className="absolute -bottom-4 -left-4 rounded-xl border border-gray-100 bg-white px-4 py-2.5 shadow-card dark:bg-surface-dark-muted dark:border-white/10 hidden lg:flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">Spam protected</p>
                      <p className="text-xs text-gray-500">All reviews moderated</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty state — shown when no reviews exist yet */
                <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-surface-dark-muted p-10 text-center">
                  <Star className="h-10 w-10 text-brand-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No reviews yet</p>
                  <p className="text-xs text-gray-400 mt-1">Be the first to review a product</p>
                  <Link href="/products" className="mt-4 inline-block">
                    <Button size="sm" variant="outline">Browse Products</Button>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-surface-dark-muted py-20 border-t border-gray-100 dark:border-white/5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">
              Why ReviewHub
            </p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Built for trust from day one
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Every feature is designed to surface authentic opinions and filter noise — so every review you read actually matters.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card hover:shadow-modal transition-shadow dark:bg-surface-dark-muted dark:border-white/8"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-slate-100">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 dark:bg-brand-800 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="mb-3 text-2xl font-bold text-white">Ready to share your experience?</h2>
          <p className="mb-8 text-brand-100">
            Join reviewers and help others make smarter decisions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/register">
              <Button variant="secondary" size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>
                Get Started Free
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" className="bg-white/10 text-white hover:bg-white/20 border border-white/20">
                Browse Reviews
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
