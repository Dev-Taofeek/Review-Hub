import type { Metadata } from 'next';
import { CategorySlugClient } from './CategorySlugClient';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Props {
  params: Promise<{ slug: string }>;
}

async function fetchCategory(slug: string) {
  try {
    const res = await fetch(`${API}/api/products/categories`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data ?? []).find((c: { slug: string }) => c.slug === slug) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug }   = await params;
  const category   = await fetchCategory(slug);

  if (!category) {
    return {
      title:       'Category Not Found',
      description: 'This category could not be found on ReviewHub.',
    };
  }

  const title       = `${category.name} – Browse & Compare Products`;
  const description = category.description
    ? `${category.description} Browse ${category.product_count ?? 'all'} products with verified community reviews.`
    : `Browse and compare ${category.name} products with verified reviews from real buyers on ReviewHub.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card:  'summary',
      title,
      description,
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/categories/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  return <CategorySlugClient slug={slug} />;
}
