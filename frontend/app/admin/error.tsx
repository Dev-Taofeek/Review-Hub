'use client';

import { RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-5">
        <ShieldAlert className="h-8 w-8 text-red-500" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        Admin panel error
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
        The admin data could not be loaded. Please refresh and try again.
      </p>
      <Button onClick={reset} icon={<RefreshCw className="h-4 w-4" />}>Retry</Button>
    </div>
  );
}
