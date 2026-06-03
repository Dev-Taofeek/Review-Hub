import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://review-hub-lilac.vercel.app';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/moderation', '/dashboard', '/profile', '/my-reviews', '/auth/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
