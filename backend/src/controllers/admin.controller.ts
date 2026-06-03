import { Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest, UserRole } from '../types';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { getPagination } from '../utils/pagination';

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pagination = getPagination(req);
    const search = req.query.search as string;
    const role = req.query.role as string;

    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(pagination.offset, pagination.offset + pagination.limit - 1);

    if (search) query = query.ilike('username', `%${search}%`);
    if (role) query = query.eq('role', role);

    const { data, error, count } = await query;
    if (error) throw error;

    sendPaginated(res, data, count ?? 0, pagination.page, pagination.limit);
  } catch {
    sendError(res, 'Failed to fetch users', 500);
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.body as { role: UserRole };
    const validRoles: UserRole[] = ['user', 'moderator', 'admin'];

    if (!validRoles.includes(role)) {
      sendError(res, 'Invalid role');
      return;
    }

    // Prevent admin from demoting themselves
    if (req.params.id === req.user!.id) {
      sendError(res, 'Cannot change your own role');
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    sendSuccess(res, data, 'User role updated');
  } catch {
    sendError(res, 'Failed to update user role', 500);
  }
};

export const banUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.params.id === req.user!.id) {
      sendError(res, 'Cannot ban yourself');
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ is_banned: req.body.is_banned })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    sendSuccess(res, data, `User ${req.body.is_banned ? 'banned' : 'unbanned'}`);
  } catch {
    sendError(res, 'Failed to update user', 500);
  }
};

export const verifyUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const is_verified = Boolean(req.body.is_verified);
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ is_verified })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) {
      console.error('verifyUser supabase error:', error);
      sendError(res, error.message || 'Failed to update verification', 500);
      return;
    }
    sendSuccess(res, data, `User ${is_verified ? 'verified' : 'unverified'}`);
  } catch (err) {
    console.error('verifyUser error:', err);
    sendError(res, (err as Error).message || 'Failed to update verification', 500);
  }
};

export const setVotePermission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.params.id === req.user!.id) {
      sendError(res, 'Cannot restrict yourself');
      return;
    }
    const can_vote = Boolean(req.body.can_vote);
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ can_vote })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    sendSuccess(res, data, `Voting ${can_vote ? 'enabled' : 'restricted'} for user`);
  } catch {
    sendError(res, 'Failed to update vote permission', 500);
  }
};

export const getAnalytics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { count: totalUsers },
      { count: newUsers },
      { count: totalProducts },
      { count: totalReviews },
      { count: newReviews },
      { count: totalReports },
      { data: topProducts },
      { data: recentActivity },
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
      supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('reviews').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('reviews').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
      supabaseAdmin.from('reports').select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('products')
        .select('id, name, total_reviews, average_rating')
        .order('total_reviews', { ascending: false })
        .limit(5),
      supabaseAdmin
        .from('reviews')
        .select('id, title, rating, created_at, user:profiles(username)')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    sendSuccess(res, {
      users: { total: totalUsers, newThisMonth: newUsers },
      products: { total: totalProducts },
      reviews: { total: totalReviews, newThisMonth: newReviews },
      reports: { total: totalReports },
      topProducts,
      recentActivity,
    });
  } catch {
    sendError(res, 'Failed to fetch analytics', 500);
  }
};
