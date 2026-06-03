'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 text-center">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        Dashboard failed to load
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
        We couldn't load your dashboard data. Check your connection and try again.
      </p>
      <Button onClick={reset} icon={<RefreshCw className="h-4 w-4" />}>Retry</Button>
    </div>
  );
}
