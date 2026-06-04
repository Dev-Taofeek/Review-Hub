import { createSupabaseServer } from '@/lib/supabase-server';
import { LandingPageClient } from '@/components/landing/LandingPageClient';

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

    const avgRating =
      ratingData && ratingData.length > 0
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

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}K+`;
  return n > 0 ? `${n}+` : '0';
}

export default async function LandingPage() {
  const { stats, recentReviews } = await getHomepageData();

  const statItems = [
    { value: formatCount(stats.reviews),  label: 'Verified Reviews' },
    { value: formatCount(stats.products), label: 'Products' },
    { value: stats.avgRating,             label: 'Avg Rating' },
    { value: formatCount(stats.users),    label: 'Reviewers' },
  ];

  return <LandingPageClient statItems={statItems} recentReviews={recentReviews} />;
}
