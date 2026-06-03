import { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://review-hub-lilac.vercel.app';
const API  = process.env.NEXT_PUBLIC_API_URL  || '';

const staticRoutes: MetadataRoute.Sitemap = [
  { url: `${BASE}/`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
  { url: `${BASE}/products`,  lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
  { url: `${BASE}/categories`,lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
  { url: `${BASE}/privacy`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.2 },
  { url: `${BASE}/terms`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [catRes, prodRes] = await Promise.all([
      fetch(`${API}/api/products/categories`, { next: { revalidate: 86400 } }),
      fetch(`${API}/api/products?limit=100`,  { next: { revalidate: 3600 } }),
    ]);

    const catData  = catRes.ok  ? await catRes.json()  : { data: [] };
    const prodData = prodRes.ok ? await prodRes.json() : { data: [] };

    const categoryRoutes: MetadataRoute.Sitemap = (catData.data ?? []).map((cat: { slug: string }) => ({
      url: `${BASE}/categories/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    const productRoutes: MetadataRoute.Sitemap = (prodData.data ?? []).map((p: { slug: string; updated_at?: string }) => ({
      url: `${BASE}/products/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
