'use client';

import Link from 'next/link';
import { PackageX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ProductsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mb-5">
        <PackageX className="h-8 w-8 text-amber-500" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        Could not load products
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
        There was a problem fetching the product list. Please try again.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} icon={<RefreshCw className="h-4 w-4" />}>Retry</Button>
        <Link href="/"><Button variant="outline">Go home</Button></Link>
      </div>
    </div>
  );
}
