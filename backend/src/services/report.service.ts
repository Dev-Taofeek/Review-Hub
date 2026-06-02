import { supabaseAdmin } from '../config/supabase';
import { Report, ReportReason, PaginationParams } from '../types';

export async function createReport(
  reviewId: string,
  reporterId: string,
  reason: ReportReason,
  message?: string
) {
  // Verify review exists
  const { data: review } = await supabaseAdmin
    .from('reviews')
    .select('id, user_id')
    .eq('id', reviewId)
    .single();

  if (!review) throw new Error('Review not found');

  // Prevent reporting own review
  if (review.user_id === reporterId) {
    throw new Error('Cannot report your own review');
  }

  // Check for duplicate report
  const { data: existing } = await supabaseAdmin
    .from('reports')
    .select('id')
    .eq('review_id', reviewId)
    .eq('reporter_id', reporterId)
    .maybeSingle();

  if (existing) {
    throw new Error('You have already reported this review');
  }

  const { data, error } = await supabaseAdmin
    .from('reports')
    .insert({
      review_id: reviewId,
      reporter_id: reporterId,
      reason,
      message,
    })
    .select()
    .single();

  if (error) throw error;

  // Auto-flag review if it gets 3+ reports
  const { count: reportCount } = await supabaseAdmin
    .from('reports')
    .select('id', { count: 'exact' })
    .eq('review_id', reviewId)
    .eq('status', 'pending');

  if ((reportCount ?? 0) >= 3) {
    await supabaseAdmin
      .from('reviews')
      .update({ status: 'flagged' })
      .eq('id', reviewId)
      .neq('status', 'rejected');
  }

  return data as Report;
}

export async function getReports(
  pagination: PaginationParams,
  status?: string
) {
  let query = supabaseAdmin
    .from('reports')
    .select(`
      *,
      reporter:profiles!reporter_id(id, username, full_name, avatar_url),
      review:reviews(id, title, body, rating, status, user_id,
        user:profiles!user_id(id, username, full_name))
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { data: data as Report[], total: count ?? 0 };
}

export async function updateReportStatus(
  reportId: string,
  status: string,
  resolvedBy: string
) {
  const { data, error } = await supabaseAdmin
    .from('reports')
    .update({
      status,
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw error;
  return data as Report;
}
