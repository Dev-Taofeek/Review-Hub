import { Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest, UserRole } from '../types';
import { sendError } from '../utils/apiResponse';

async function fetchProfile(userId: string) {
  // Try full select first (includes new columns added via migration)
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, username, full_name, avatar_url, role, is_banned, is_verified, can_vote')
    .eq('id', userId)
    .single();

  if (!error) return data;

  // If the query failed (e.g. new columns not yet migrated), fall back to base columns
  const { data: fallback, error: fallbackError } = await supabaseAdmin
    .from('profiles')
    .select('id, username, full_name, avatar_url, role, is_banned')
    .eq('id', userId)
    .single();

  if (fallbackError || !fallback) return null;

  // Provide safe defaults for columns that may not exist yet
  return { ...fallback, is_verified: false, can_vote: true };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 'Authorization token required', 401);
    return;
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    sendError(res, 'Invalid or expired token', 401);
    return;
  }

  const profile = await fetchProfile(user.id);

  if (!profile) {
    sendError(res, 'User profile not found — please sign out and sign back in', 401);
    return;
  }

  if (profile.is_banned) {
    sendError(res, 'Account has been suspended', 403);
    return;
  }

  req.user = {
    id:          user.id,
    email:       user.email!,
    role:        profile.role as UserRole,
    username:    profile.username,
    full_name:   profile.full_name,
    avatar_url:  profile.avatar_url,
    is_banned:   profile.is_banned,
    is_verified: profile.is_verified ?? false,
    can_vote:    profile.can_vote    ?? true,
  };

  next();
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);

  if (user) {
    const profile = await fetchProfile(user.id);

    if (profile && !profile.is_banned) {
      req.user = {
        id:          user.id,
        email:       user.email!,
        role:        profile.role as UserRole,
        username:    profile.username,
        full_name:   profile.full_name,
        avatar_url:  profile.avatar_url,
        is_banned:   profile.is_banned,
        is_verified: profile.is_verified ?? false,
        can_vote:    profile.can_vote    ?? true,
      };
    }
  }

  next();
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }
    if (!roles.includes(req.user.role)) {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }
    next();
  };
};

export const requireModerator = requireRole('moderator', 'admin');
export const requireAdmin     = requireRole('admin');
