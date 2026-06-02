export type UserRole = 'user' | 'moderator' | 'admin';
export type ReviewStatus = 'pending' | 'published' | 'flagged' | 'rejected';
export type ReportReason = 'spam' | 'abuse' | 'hate_speech' | 'fake_review' | 'misleading_content' | 'offensive_language' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  is_banned?: boolean;
  is_verified?: boolean;
  can_vote?: boolean;
  review_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  public_id: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  category_id?: string;
  category?: Category;
  price: number;
  average_rating: number;
  total_reviews: number;
  is_active: boolean;
  images?: ProductImage[];
  rating_distribution?: RatingDistribution;
  created_at: string;
}

export interface ReviewImage {
  id: string;
  url: string;
  public_id: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  body: string;
  pros?: string[];
  cons?: string[];
  status: ReviewStatus;
  spam_score?: number;
  helpful_count: number;
  is_verified_purchase?: boolean;
  user?: Partial<User>;
  images?: ReviewImage[];
  user_vote?: boolean | null;
  product?: Partial<Product>;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  review_id: string;
  reporter_id: string;
  reason: ReportReason;
  message?: string;
  status: ReportStatus;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  reporter?: Partial<User>;
  review?: Partial<Review>;
}

export interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
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
