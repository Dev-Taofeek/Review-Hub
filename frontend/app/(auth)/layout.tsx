import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { template: '%s | ReviewHub', default: 'Sign in – ReviewHub' },
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="trust-shell min-h-screen">
      {children}
    </div>
  );
}
