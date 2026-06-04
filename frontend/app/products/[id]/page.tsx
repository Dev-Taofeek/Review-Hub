import type { Metadata } from 'next';
import type { ProductImage } from '@/types';
import { ProductDetailClient } from './ProductDetailClient';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Props {
  params: Promise<{ id: string }>;
}

async function fetchProduct(slug: string) {
  try {
    const res = await fetch(`${API}/api/products/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'This product could not be found on ReviewHub.',
    };
  }

  const title       = `${product.name} Reviews`;
  const description = `Read ${product.total_reviews} verified reviews for the ${product.name} by ${product.brand}. Average rating: ${product.average_rating?.toFixed(1)}/5.`;
  const image       = product.images?.find((i: ProductImage) => i.is_primary)?.url ?? product.images?.[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(image ? { images: [{ url: image, alt: product.name }] } : {}),
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id }    = await params;
  const product   = await fetchProduct(id);

  /* JSON-LD structured data for search engines */
  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name:        product.name,
    brand:       { '@type': 'Brand', name: product.brand },
    description: product.description,
    image:       product.images?.find((i: ProductImage) => i.is_primary)?.url,
    offers: {
      '@type':         'Offer',
      price:           product.price,
      priceCurrency:   'USD',
      availability:    'https://schema.org/InStock',
    },
    aggregateRating: product.total_reviews > 0 ? {
      '@type':       'AggregateRating',
      ratingValue:   product.average_rating?.toFixed(1),
      reviewCount:   product.total_reviews,
      bestRating:    5,
      worstRating:   1,
    } : undefined,
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailClient slug={id} />
    </>
  );
}
