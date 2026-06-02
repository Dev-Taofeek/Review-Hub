import { Request } from 'express';

export type UserRole = 'user' | 'moderator' | 'admin';
export type ReviewStatus = 'pending' | 'published' | 'flagged' | 'rejected';
export type ReportReason = 'spam' | 'abuse' | 'hate_speech' | 'fake_review' | 'misleading_content' | 'offensive_language' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';
export type ModerationAction = 'approved' | 'rejected' | 'flagged' | 'deleted' | 'restored';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  is_banned: boolean;
  is_verified: boolean;
  can_vote: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  is_banned: boolean;
  is_verified: boolean;
  can_vote: boolean;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  category_id: string | null;
  price: number;
  average_rating: number;
  total_reviews: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  public_id: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  body: string;
  pros: string[] | null;
  cons: string[] | null;
  status: ReviewStatus;
  spam_score: number;
  helpful_count: number;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  user?: Profile;
  images?: ReviewImage[];
  user_vote?: boolean | null;
}

export interface ReviewImage {
  id: string;
  review_id: string;
  url: string;
  public_id: string;
  created_at: string;
}

export interface ReviewVote {
  id: string;
  review_id: string;
  user_id: string;
  is_helpful: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  review_id: string;
  reporter_id: string;
  reason: ReportReason;
  message: string | null;
  status: ReportStatus;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  reporter?: Profile;
  review?: Review;
}

export interface ModerationLog {
  id: string;
  review_id: string | null;
  moderator_id: string;
  action: ModerationAction;
  reason: string | null;
  previous_status: ReviewStatus | null;
  new_status: ReviewStatus | null;
  created_at: string;
  moderator?: Profile;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SpamCheckResult {
  isSpam: boolean;
  spamScore: number;
  flags: string[];
  suggestedStatus: ReviewStatus;
}

export interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest' | 'most_reviewed';
}

export interface ModerationStats {
  total: number;
  published: number;
  pending: number;
  flagged: number;
  rejected: number;
  totalReports: number;
  pendingReports: number;
}
