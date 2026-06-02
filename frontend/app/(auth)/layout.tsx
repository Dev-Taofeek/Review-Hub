import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { template: '%s | ReviewHub', default: 'ReviewHub' },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark">
      {children}
    </div>
  );
}
