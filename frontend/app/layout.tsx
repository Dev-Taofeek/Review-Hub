import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { ConditionalShell } from '@/components/layout/ConditionalShell';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ThemeProvider } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | ReviewHub',
    default:  'ReviewHub – Honest Product Reviews',
  },
  description: 'Discover and share honest product reviews. Browse ratings, write reviews, and make informed purchase decisions.',
  keywords: ['product reviews', 'ratings', 'reviews', 'consumer reviews'],
  openGraph: {
    type: 'website',
    siteName: 'ReviewHub',
    title: 'ReviewHub – Honest Product Reviews',
    description: 'Discover and share honest product reviews.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 dark:bg-[#060c1a] dark:text-slate-100">
        <ThemeProvider>
        <ScrollToTop />
        <ConditionalShell>{children}</ConditionalShell>
        <Toaster
          position="top-right"
          toastOptions={{
            className: '!rounded-xl !shadow-modal !text-sm',
            success: { duration: 3000 },
            error:   { duration: 4000 },
          }}
        />
        </ThemeProvider>
      </body>
    </html>
  );
}
