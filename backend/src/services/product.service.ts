import { supabaseAdmin } from '../config/supabase';
import { Product, ProductFilters, PaginationParams } from '../types';

export async function getProducts(
  filters: ProductFilters,
  pagination: PaginationParams
) {
  // Resolve category slug → id before building the main query
  let categoryId: string | undefined;
  if (filters.category) {
    const { data: cat } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('slug', filters.category)
      .maybeSingle();
    if (!cat) return { data: [] as Product[], total: 0 };
    categoryId = cat.id;
  }

  let query = supabaseAdmin
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug, icon),
      images:product_images(id, url, public_id, alt_text, is_primary, sort_order)
    `, { count: 'exact' })
    .eq('is_active', true);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (filters.brand) {
    query = query.ilike('brand', `%${filters.brand}%`);
  }

  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }

  if (filters.minRating !== undefined) {
    query = query.gte('average_rating', filters.minRating);
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    query = query.or(`name.ilike.${term},description.ilike.${term},brand.ilike.${term}`);
  }

  switch (filters.sortBy) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'rating_desc':
      query = query.order('average_rating', { ascending: false });
      break;
    case 'most_reviewed':
      query = query.order('total_reviews', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return { data: data as Product[], total: count ?? 0 };
}

export async function getProductById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug, icon),
      images:product_images(id, url, public_id, alt_text, is_primary, sort_order)
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data as Product;
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug, icon),
      images:product_images(id, url, public_id, alt_text, is_primary, sort_order)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data as Product;
}

export async function createProduct(productData: Partial<Product>, userId: string) {
  const slug = await generateUniqueSlug(productData.name!);

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      ...productData,
      slug,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string) {
  const { error } = await supabaseAdmin
    .from('products')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
}

export async function getProductRatingDistribution(productId: string) {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('status', 'published');

  if (error) throw error;

  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const review of data ?? []) {
    const r = review.rating as 1 | 2 | 3 | 4 | 5;
    if (r >= 1 && r <= 5) dist[r]++;
  }

  return dist;
}

async function generateUniqueSlug(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  let slug = base;
  let counter = 1;

  while (true) {
    const { data } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!data) break;
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

export async function addProductImage(
  productId: string,
  url: string,
  publicId: string,
  altText?: string,
  isPrimary = false
) {
  const { data, error } = await supabaseAdmin
    .from('product_images')
    .insert({ product_id: productId, url, public_id: publicId, alt_text: altText, is_primary: isPrimary })
    .select()
    .single();

  if (error) throw error;
  return data;
}
