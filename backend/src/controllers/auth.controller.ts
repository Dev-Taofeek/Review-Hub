import { Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    sendError(res, 'Not authenticated', 401);
    return;
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error || !profile) {
    sendError(res, 'Profile not found', 404);
    return;
  }

  sendSuccess(res, profile);
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    sendError(res, 'Not authenticated', 401);
    return;
  }

  const { username, full_name, bio, avatar_url } = req.body;

  if (username) {
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', req.user.id)
      .maybeSingle();

    if (existing) {
      sendError(res, 'Username already taken');
      return;
    }
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ username, full_name, bio, avatar_url })
    .eq('id', req.user.id)
    .select()
    .single();

  if (error) {
    sendError(res, 'Failed to update profile', 500);
    return;
  }

  sendSuccess(res, data, 'Profile updated successfully');
};

export const getMyStats = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    sendError(res, 'Not authenticated', 401);
    return;
  }

  const userId = req.user.id;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: reviews, error: reviewsError },
    { count: recentCount },
  ] = await Promise.all([
    supabaseAdmin
      .from('reviews')
      .select(`
        id, status, rating, helpful_count, created_at, title,
        product:products(id, name, slug, images:product_images(url, is_primary))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo),
  ]);

  if (reviewsError) {
    sendError(res, 'Failed to fetch stats', 500);
    return;
  }

  const allReviews = reviews ?? [];
  const published  = allReviews.filter((r) => r.status === 'published');
  const pending    = allReviews.filter((r) => r.status === 'pending');
  const flagged    = allReviews.filter((r) => r.status === 'flagged');
  const rejected   = allReviews.filter((r) => r.status === 'rejected');

  const totalHelpful  = allReviews.reduce((sum, r) => sum + (r.helpful_count ?? 0), 0);
  const avgRating     = published.length > 0
    ? Math.round((published.reduce((sum, r) => sum + r.rating, 0) / published.length) * 10) / 10
    : 0;

  sendSuccess(res, {
    overview: {
      totalReviews:    allReviews.length,
      publishedReviews: published.length,
      pendingReviews:  pending.length,
      flaggedReviews:  flagged.length,
      rejectedReviews: rejected.length,
      totalHelpfulVotes: totalHelpful,
      averageRating:   avgRating,
      reviewsThisMonth: recentCount ?? 0,
    },
    recentReviews: allReviews.slice(0, 6),
  });
};
