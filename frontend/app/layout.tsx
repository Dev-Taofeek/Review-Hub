import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { ConditionalShell } from '@/components/layout/ConditionalShell';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { ThemeProvider } from '@/lib/theme';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets:  ['latin'],
  variable: '--font-heading',
  display:  'swap',
});

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-body',
  display:  'swap',
});

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://review-hub-lilac.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    template: '%s | ReviewHub',
    default:  'ReviewHub – Honest Product Reviews',
  },
  description:
    'Discover and share honest product reviews from real buyers. Community-moderated, spam-filtered ratings to help you shop with confidence.',
  keywords: [
    'product reviews', 'honest reviews', 'verified ratings', 'consumer reviews',
    'buy guides', 'product ratings', 'community reviews',
  ],
  authors:  [{ name: 'ReviewHub' }],
  creator:  'ReviewHub',
  publisher:'ReviewHub',
  openGraph: {
    type:        'website',
    siteName:    'ReviewHub',
    title:       'ReviewHub – Honest Product Reviews',
    description: 'Discover and share honest product reviews from real buyers.',
    url:         BASE,
    locale:      'en_US',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'ReviewHub – Honest Product Reviews' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'ReviewHub – Honest Product Reviews',
    description: 'Discover and share honest product reviews from real buyers.',
    images:      ['/og-image.png'],
  },
  robots: {
    index:           true,
    follow:          true,
    googleBot: {
      index:              true,
      follow:             true,
      'max-image-preview':'large',
      'max-snippet':      -1,
    },
  },
  alternates: { canonical: BASE },
};

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  themeColor:   [
    { media: '(prefers-color-scheme: light)', color: '#FCF8F2' },
    { media: '(prefers-color-scheme: dark)',  color: '#081711' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full scroll-smooth ${plusJakarta.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.className} flex min-h-full flex-col bg-trust text-[var(--foreground)]`}>
        {/* Skip navigation for keyboard/screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-xl focus:bg-brand-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus: focus:outline-none"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <ScrollProgress />
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
