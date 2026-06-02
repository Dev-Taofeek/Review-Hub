import type { Metadata } from 'next';
import { ProductDetailClient } from './ProductDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Product | ReviewHub`,
    openGraph: { title: `Product | ReviewHub` },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  return <ProductDetailClient slug={id} />;
}
