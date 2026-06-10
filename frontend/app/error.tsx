'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error reporting service (e.g. Sentry) in production
    console.error('[ReviewHub Error]', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="h-20 w-20 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-6 ">
        <AlertTriangle className="h-10 w-10 text-red-500" aria-hidden="true" />
      </div>

      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
        Something went wrong
      </h1>
      <p className="text-[var(--muted)] mb-2 max-w-md leading-relaxed">
        An unexpected error occurred. The issue has been logged and we're working on it.
      </p>
      {error.digest && (
        <p className="text-xs text-[var(--muted)] font-mono mb-8">Error ID: {error.digest}</p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={reset}
          icon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
        >
          Try again
        </Button>
        <Link href="/">
          <Button
            variant="outline"
            icon={<Home className="h-4 w-4" aria-hidden="true" />}
          >
            Go home
          </Button>
        </Link>
      </div>
    </div>
  );
}
