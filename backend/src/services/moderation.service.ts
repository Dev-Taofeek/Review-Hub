import { supabaseAdmin } from '../config/supabase';
import { ReviewStatus, ModerationAction, ModerationStats, PaginationParams } from '../types';

export async function getModerationQueue(
  pagination: PaginationParams,
  statusFilter?: ReviewStatus
) {
  const status = statusFilter ?? 'pending';

  const { data, error, count } = await supabaseAdmin
    .from('reviews')
    .select(`
      *,
      user:profiles(id, username, full_name, avatar_url),
      product:products(id, name, slug),
      images:review_images(id, url),
      reports:reports(id, reason, status)
    `, { count: 'exact' })
    .eq('status', status)
    .order('spam_score', { ascending: false })
    .order('created_at', { ascending: false })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);

  if (error) throw error;

  return { data, total: count ?? 0 };
}

export async function moderateReview(
  reviewId: string,
  moderatorId: string,
  action: ModerationAction,
  reason?: string
) {
  const { data: review } = await supabaseAdmin
    .from('reviews')
    .select('id, status')
    .eq('id', reviewId)
    .single();

  if (!review) throw new Error('Review not found');

  let newStatus: ReviewStatus | undefined;

  switch (action) {
    case 'approved':
      newStatus = 'published';
      break;
    case 'rejected':
      newStatus = 'rejected';
      break;
    case 'flagged':
      newStatus = 'flagged';
      break;
    case 'restored':
      newStatus = 'published';
      break;
    case 'deleted':
      await supabaseAdmin.from('reviews').delete().eq('id', reviewId);
      await logModerationAction(reviewId, moderatorId, action, reason, review.status, undefined);
      return null;
  }

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .update({ status: newStatus })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;

  await logModerationAction(reviewId, moderatorId, action, reason, review.status, newStatus);

  return data;
}

async function logModerationAction(
  reviewId: string,
  moderatorId: string,
  action: ModerationAction,
  reason: string | undefined,
  previousStatus: ReviewStatus,
  newStatus: ReviewStatus | undefined
) {
  await supabaseAdmin.from('moderation_logs').insert({
    review_id: reviewId,
    moderator_id: moderatorId,
    action,
    reason,
    previous_status: previousStatus,
    new_status: newStatus,
  });
}

export async function getModerationStats(): Promise<ModerationStats> {
  const [
    { count: total },
    { count: published },
    { count: pending },
    { count: flagged },
    { count: rejected },
    { count: totalReports },
    { count: pendingReports },
  ] = await Promise.all([
    supabaseAdmin.from('reviews').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabaseAdmin.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'flagged'),
    supabaseAdmin.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
    supabaseAdmin.from('reports').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  return {
    total: total ?? 0,
    published: published ?? 0,
    pending: pending ?? 0,
    flagged: flagged ?? 0,
    rejected: rejected ?? 0,
    totalReports: totalReports ?? 0,
    pendingReports: pendingReports ?? 0,
  };
}

export async function getModerationLogs(pagination: PaginationParams) {
  const { data, error, count } = await supabaseAdmin
    .from('moderation_logs')
    .select(`
      *,
      moderator:profiles(id, username, full_name),
      review:reviews(id, title, product_id)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);

  if (error) throw error;
  return { data, total: count ?? 0 };
}
