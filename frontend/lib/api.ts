import { createClient } from './supabase';
import type {
  ApiResponse,
  PaginatedResponse,
  Product,
  Review,
  Report,
  User,
  Category,
  ModerationStats,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getToken(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (body.details && Array.isArray(body.details) && body.details.length > 0) {
      const messages = body.details
        .map((d: { field: string; message: string }) => d.message)
        .join(' · ');
      throw new Error(messages);
    }
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  getMe: () => request<ApiResponse<User>>('/api/auth/me'),
  getMyStats: () => request<ApiResponse<{
    overview: {
      totalReviews: number;
      publishedReviews: number;
      pendingReviews: number;
      flaggedReviews: number;
      rejectedReviews: number;
      totalHelpfulVotes: number;
      averageRating: number;
      reviewsThisMonth: number;
    };
    recentReviews: Array<{
      id: string;
      status: string;
      rating: number;
      helpful_count: number;
      created_at: string;
      title: string;
      product: { id: string; name: string; slug: string; images: Array<{ url: string; is_primary: boolean }> } | null;
    }>;
  }>>('/api/auth/me/stats'),
  updateProfile: (data: Partial<User>) =>
    request<ApiResponse<User>>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// ── Products ──────────────────────────────────────────────────────────────────

export const productsApi = {
  getAll: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return request<PaginatedResponse<Product>>(`/api/products${qs}`);
  },
  getOne: (idOrSlug: string) => request<ApiResponse<Product>>(`/api/products/${idOrSlug}`),
  getCategories: () => request<ApiResponse<Category[]>>('/api/products/categories'),
  create: (data: Partial<Product>) =>
    request<ApiResponse<Product>>('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Product>) =>
    request<ApiResponse<Product>>(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<ApiResponse<null>>(`/api/products/${id}`, { method: 'DELETE' }),
};

// ── Reviews ───────────────────────────────────────────────────────────────────

export const reviewsApi = {
  getByProduct: (productId: string, params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return request<PaginatedResponse<Review>>(`/api/products/${productId}/reviews${qs}`);
  },
  create: (productId: string, data: Partial<Review>) =>
    request<ApiResponse<{ review: Review; spamFlags?: string[] }>>(`/api/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Review>) =>
    request<ApiResponse<Review>>(`/api/reviews/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<ApiResponse<null>>(`/api/reviews/${id}`, { method: 'DELETE' }),
  vote: (id: string, isHelpful: boolean) =>
    request<ApiResponse<{ action: string }>>(`/api/reviews/${id}/helpful`, {
      method: 'POST',
      body: JSON.stringify({ is_helpful: isHelpful }),
    }),
  getMyReviews: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return request<PaginatedResponse<Review>>(`/api/reviews/me${qs}`);
  },
};

// ── Reports ───────────────────────────────────────────────────────────────────

export const reportsApi = {
  create: (reviewId: string, data: { reason: string; message?: string }) =>
    request<ApiResponse<Report>>(`/api/reports/reviews/${reviewId}/report`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAll: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<PaginatedResponse<Report>>(`/api/reports${qs}`);
  },
  update: (id: string, status: string) =>
    request<ApiResponse<Report>>(`/api/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// ── Moderation ────────────────────────────────────────────────────────────────

export const moderationApi = {
  getQueue: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<PaginatedResponse<Review>>(`/api/moderation/reviews${qs}`);
  },
  getStats: () => request<ApiResponse<ModerationStats>>('/api/moderation/stats'),
  getLogs: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<PaginatedResponse<unknown>>(`/api/moderation/logs${qs}`);
  },
  approve: (id: string, reason?: string) =>
    request<ApiResponse<Review>>(`/api/moderation/reviews/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),
  reject: (id: string, reason?: string) =>
    request<ApiResponse<Review>>(`/api/moderation/reviews/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),
  flag: (id: string, reason?: string) =>
    request<ApiResponse<Review>>(`/api/moderation/reviews/${id}/flag`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminApi = {
  getUsers: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<PaginatedResponse<User>>(`/api/admin/users${qs}`);
  },
  updateRole: (userId: string, role: string) =>
    request<ApiResponse<User>>(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  banUser: (userId: string, is_banned: boolean) =>
    request<ApiResponse<User>>(`/api/admin/users/${userId}/ban`, {
      method: 'PATCH',
      body: JSON.stringify({ is_banned }),
    }),
  verifyUser: (userId: string, is_verified: boolean) =>
    request<ApiResponse<User>>(`/api/admin/users/${userId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ is_verified }),
    }),
  setVotePermission: (userId: string, can_vote: boolean) =>
    request<ApiResponse<User>>(`/api/admin/users/${userId}/vote`, {
      method: 'PATCH',
      body: JSON.stringify({ can_vote }),
    }),
  getAnalytics: () => request<ApiResponse<unknown>>('/api/admin/analytics'),
};

// ── Uploads ───────────────────────────────────────────────────────────────────

export const uploadsApi = {
  uploadProductImage: async (productId: string, file: File, isPrimary = false) => {
    const token = await getToken();
    const fd = new FormData();
    fd.append('image', file);
    fd.append('is_primary', String(isPrimary));
    const res = await fetch(`${API_URL}/api/uploads/products/${productId}`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: fd,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },
  uploadReviewImage: async (reviewId: string, file: File) => {
    const token = await getToken();
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch(`${API_URL}/api/uploads/reviews/${reviewId}`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: fd,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },
  uploadAvatar: async (file: File) => {
    const token = await getToken();
    const fd = new FormData();
    fd.append('avatar', file);
    const res = await fetch(`${API_URL}/api/uploads/avatar`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: fd,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },
};
