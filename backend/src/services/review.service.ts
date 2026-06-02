import { supabaseAdmin } from '../config/supabase';
import { Review, PaginationParams } from '../types';
import { detectSpam, checkDuplicateContent } from '../utils/spamDetection';

export async function getProductReviews(
  productId: string,
  pagination: PaginationParams,
  userId?: string
) {
  let query = supabaseAdmin
    .from('reviews')
    .select(`
      *,
      user:profiles(id, username, full_name, avatar_url, is_verified),
      images:review_images(id, url, public_id)
    `, { count: 'exact' })
    .eq('product_id', productId)
    .eq('status', 'published')
    .order('helpful_count', { ascending: false })
    .order('created_at', { ascending: false })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  let reviewsWithVotes = (data as Review[]).sort((a, b) => {
    const aVer = (a.user as any)?.is_verified ? 1 : 0;
    const bVer = (b.user as any)?.is_verified ? 1 : 0;
    if (bVer !== aVer) return bVer - aVer;
    if (b.helpful_count !== a.helpful_count) return b.helpful_count - a.helpful_count;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (userId) {
    const reviewIds = reviewsWithVotes.map((r) => r.id);
    const { data: votes } = await supabaseAdmin
      .from('review_votes')
      .select('review_id, is_helpful')
      .eq('user_id', userId)
      .in('review_id', reviewIds);

    const voteMap = new Map(votes?.map((v) => [v.review_id, v.is_helpful]) ?? []);
    reviewsWithVotes = reviewsWithVotes.map((r) => ({
      ...r,
      user_vote: voteMap.get(r.id) ?? null,
    }));
  }

  return { data: reviewsWithVotes, total: count ?? 0 };
}

export async function getReviewById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select(`
      *,
      user:profiles(id, username, full_name, avatar_url),
      images:review_images(id, url, public_id)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Review;
}

export async function createReview(
  productId: string,
  userId: string,
  reviewData: {
    rating: number;
    title: string;
    body: string;
    pros?: string[];
    cons?: string[];
  }
) {
  // Check for duplicate review
  const { data: existing } = await supabaseAdmin
    .from('reviews')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    throw new Error('You have already reviewed this product');
  }

  // Check recent review count for rate limiting spam detection
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await supabaseAdmin
    .from('reviews')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .gte('created_at', oneHourAgo);

  // Get recent published reviews for duplicate content check
  const { data: recentReviews } = await supabaseAdmin
    .from('reviews')
    .select('body')
    .eq('product_id', productId)
    .eq('status', 'published')
    .limit(50);

  const existingBodies = recentReviews?.map((r) => r.body) ?? [];
  const isDuplicate = checkDuplicateContent(reviewData.body, existingBodies);

  const spamResult = detectSpam({
    title: reviewData.title,
    body: reviewData.body,
    rating: reviewData.rating,
    userId,
    productId,
    recentReviewCount: recentCount ?? 0,
  });

  let finalStatus = spamResult.suggestedStatus;
  if (isDuplicate) {
    finalStatus = 'flagged';
  }

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .insert({
      product_id: productId,
      user_id: userId,
      rating: reviewData.rating,
      title: reviewData.title,
      body: reviewData.body,
      pros: reviewData.pros ?? [],
      cons: reviewData.cons ?? [],
      status: finalStatus,
      spam_score: spamResult.spamScore,
    })
    .select(`
      *,
      user:profiles(id, username, full_name, avatar_url),
      images:review_images(id, url, public_id)
    `)
    .single();

  if (error) throw error;

  return { review: data as Review, spamFlags: spamResult.flags, status: finalStatus };
}

export async function updateReview(
  id: string,
  userId: string,
  updates: {
    rating?: number;
    title?: string;
    body?: string;
    pros?: string[];
    cons?: string[];
  }
) {
  const { data: existing } = await supabaseAdmin
    .from('reviews')
    .select('id, user_id, product_id, status, body, title, rating')
    .eq('id', id)
    .single();

  if (!existing) throw new Error('Review not found');
  if (existing.user_id !== userId) throw new Error('Unauthorized');
  if (existing.status === 'rejected') throw new Error('Cannot edit a rejected review');

  // Re-run spam detection if content changed
  if (updates.body || updates.title || updates.rating) {
    const spamResult = detectSpam({
      title: updates.title ?? existing.title,
      body: updates.body ?? existing.body,
      rating: updates.rating ?? existing.rating,
      userId,
      productId: existing.product_id,
    });

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .update({
        ...updates,
        spam_score: spamResult.spamScore,
        status: existing.status === 'published' ? spamResult.suggestedStatus : existing.status,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  }

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Review;
}

export async function deleteReview(id: string, userId: string, isModeratorOrAdmin: boolean) {
  const { data: existing } = await supabaseAdmin
    .from('reviews')
    .select('id, user_id')
    .eq('id', id)
    .single();

  if (!existing) throw new Error('Review not found');
  if (!isModeratorOrAdmin && existing.user_id !== userId) throw new Error('Unauthorized');

  const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id);
  if (error) throw error;
}

export async function voteReview(reviewId: string, userId: string, isHelpful: boolean) {
  // Can't vote on own review
  const { data: review } = await supabaseAdmin
    .from('reviews')
    .select('user_id')
    .eq('id', reviewId)
    .single();

  if (!review) throw new Error('Review not found');
  if (review.user_id === userId) throw new Error('Cannot vote on your own review');

  // Upsert vote
  const { data: existing } = await supabaseAdmin
    .from('review_votes')
    .select('id, is_helpful')
    .eq('review_id', reviewId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    if (existing.is_helpful === isHelpful) {
      // Toggle off
      await supabaseAdmin.from('review_votes').delete().eq('id', existing.id);
      return { action: 'removed' };
    }
    await supabaseAdmin
      .from('review_votes')
      .update({ is_helpful: isHelpful })
      .eq('id', existing.id);
    return { action: 'updated' };
  }

  await supabaseAdmin
    .from('review_votes')
    .insert({ review_id: reviewId, user_id: userId, is_helpful: isHelpful });

  return { action: 'added' };
}

export async function getUserReviews(userId: string, pagination: PaginationParams) {
  const { data, error, count } = await supabaseAdmin
    .from('reviews')
    .select(`
      *,
      product:products(id, name, slug, images:product_images(url, is_primary)),
      images:review_images(id, url)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);

  if (error) throw error;
  return { data: data as Review[], total: count ?? 0 };
}
