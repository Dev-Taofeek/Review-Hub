import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Categories',
  description: 'Explore product categories on ReviewHub. Find electronics, fashion, home goods, and more — all with verified community reviews.',
  openGraph: {
    title: 'Browse Categories – ReviewHub',
    description: 'Find products faster by browsing our categories. Every product has verified community reviews.',
  },
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
