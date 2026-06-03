import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Reviews',
  description: 'Manage all your submitted product reviews on ReviewHub.',
  robots: { index: false, follow: false },
};

export default function MyReviewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
