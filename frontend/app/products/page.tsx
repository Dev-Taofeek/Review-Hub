import type { Metadata } from 'next';
import { ProductsClient } from './ProductsClient';

export const metadata: Metadata = {
  title: 'Browse Products',
  description: 'Discover and compare products with verified community reviews.',
};

export default function ProductsPage() {
  return <ProductsClient />;
}
