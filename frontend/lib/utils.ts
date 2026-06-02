import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return formatDate(date);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + '…';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getInitials(name?: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getRatingLabel(rating: number): string {
  if (rating >= 4.5) return 'Exceptional';
  if (rating >= 4) return 'Excellent';
  if (rating >= 3.5) return 'Very Good';
  if (rating >= 3) return 'Good';
  if (rating >= 2) return 'Fair';
  return 'Poor';
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    published: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    pending:   'text-amber-600  bg-amber-50  border-amber-200',
    flagged:   'text-orange-600 bg-orange-50 border-orange-200',
    rejected:  'text-red-600    bg-red-50    border-red-200',
    resolved:  'text-emerald-600 bg-emerald-50 border-emerald-200',
    dismissed: 'text-slate-500  bg-slate-50  border-slate-200',
    reviewed:  'text-blue-600   bg-blue-50   border-blue-200',
  };
  return map[status] ?? 'text-slate-600 bg-slate-50 border-slate-200';
}

export function getRoleColor(role: string): string {
  const map: Record<string, string> = {
    admin:     'text-purple-600 bg-purple-50 border-purple-200',
    moderator: 'text-blue-600   bg-blue-50   border-blue-200',
    user:      'text-slate-600  bg-slate-50  border-slate-200',
  };
  return map[role] ?? 'text-slate-600 bg-slate-50 border-slate-200';
}

export function buildProductImageUrl(image?: { url: string } | null, fallback = '/placeholder-product.svg'): string {
  return image?.url || fallback;
}

export const REPORT_REASONS: { value: string; label: string }[] = [
  { value: 'spam',                label: 'Spam or advertising' },
  { value: 'abuse',               label: 'Abuse or harassment' },
  { value: 'hate_speech',         label: 'Hate speech' },
  { value: 'fake_review',         label: 'Fake or incentivized review' },
  { value: 'misleading_content',  label: 'Misleading or false information' },
  { value: 'offensive_language',  label: 'Offensive language' },
  { value: 'other',               label: 'Other' },
];
