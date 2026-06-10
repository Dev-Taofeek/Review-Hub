import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Home } from 'lucide-react';

export const metadata: Metadata = {
  title:  '404 – Page Not Found',
  description: 'The page you are looking for does not exist or has been moved.',
  robots: { index: false, follow: false },
};

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 text-6xl font-black text-slate-100 dark:text-white/10 select-none" aria-hidden="true">
        404
      </div>
      <h1 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">Page not found</h1>
      <p className="mb-6 text-sm text-slate-500 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/">
        <Button icon={<Home className="h-4 w-4" aria-hidden="true" />}>Back to Home</Button>
      </Link>
    </div>
  );
}
