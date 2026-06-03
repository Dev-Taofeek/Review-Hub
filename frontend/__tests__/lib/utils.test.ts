import {
  cn,
  formatPrice,
  formatDate,
  formatRelativeTime,
  truncate,
  slugify,
  getInitials,
  getRatingLabel,
  getStatusColor,
  getRoleColor,
  buildProductImageUrl,
} from '@/lib/utils';

/* ── cn ───────────────────────────────────────────────────── */
describe('cn()', () => {
  it('merges class strings', () => {
    expect(cn('a', 'b')).toBe('a b');
  });
  it('deduplicates conflicting Tailwind classes', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });
  it('ignores falsy values', () => {
    expect(cn('a', false && 'b', null, undefined, 0 as any)).toBe('a');
  });
  it('handles conditional objects', () => {
    expect(cn({ 'text-red-500': true, 'text-green-500': false })).toBe('text-red-500');
  });
});

/* ── formatPrice ──────────────────────────────────────────── */
describe('formatPrice()', () => {
  it('formats whole dollars', () => {
    expect(formatPrice(10)).toBe('$10.00');
  });
  it('formats cents', () => {
    expect(formatPrice(9.99)).toBe('$9.99');
  });
  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });
  it('formats large numbers', () => {
    expect(formatPrice(1299.95)).toBe('$1,299.95');
  });
});

/* ── formatDate ───────────────────────────────────────────── */
describe('formatDate()', () => {
  it('formats a valid ISO date', () => {
    const result = formatDate('2024-01-15T00:00:00Z');
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2024/);
  });
});

/* ── formatRelativeTime ───────────────────────────────────── */
describe('formatRelativeTime()', () => {
  const minsAgo  = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();
  const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
  const daysAgo  = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

  it('returns "just now" for < 60s', () => {
    expect(formatRelativeTime(new Date(Date.now() - 30000).toISOString())).toBe('just now');
  });
  it('returns minutes ago', () => {
    expect(formatRelativeTime(minsAgo(5))).toBe('5m ago');
  });
  it('returns hours ago', () => {
    expect(formatRelativeTime(hoursAgo(3))).toBe('3h ago');
  });
  it('returns days ago', () => {
    expect(formatRelativeTime(daysAgo(2))).toBe('2d ago');
  });
  it('returns weeks ago', () => {
    expect(formatRelativeTime(daysAgo(14))).toBe('2w ago');
  });
});

/* ── truncate ─────────────────────────────────────────────── */
describe('truncate()', () => {
  it('returns string unchanged if within limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });
  it('truncates with ellipsis', () => {
    const result = truncate('Hello, World!', 5);
    expect(result).toMatch(/…$/);
    expect(result.length).toBeLessThanOrEqual(6);
  });
  it('returns exact-length string unchanged', () => {
    expect(truncate('exact', 5)).toBe('exact');
  });
});

/* ── slugify ──────────────────────────────────────────────── */
describe('slugify()', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });
  it('strips special characters', () => {
    expect(slugify('Sony WH-1000XM5!')).toBe('sony-wh-1000xm5');
  });
  it('removes leading/trailing hyphens', () => {
    expect(slugify('  hello  ')).toBe('hello');
  });
  it('handles numbers', () => {
    expect(slugify('iPhone 15 Pro')).toBe('iphone-15-pro');
  });
});

/* ── getInitials ──────────────────────────────────────────── */
describe('getInitials()', () => {
  it('returns two initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });
  it('returns single initial for single name', () => {
    expect(getInitials('Alice')).toBe('A');
  });
  it('returns ? for null/undefined', () => {
    expect(getInitials(null)).toBe('?');
    expect(getInitials(undefined)).toBe('?');
    expect(getInitials('')).toBe('?');
  });
  it('uppercases initials', () => {
    expect(getInitials('jane smith')).toBe('JS');
  });
});

/* ── getRatingLabel ───────────────────────────────────────── */
describe('getRatingLabel()', () => {
  it('labels exceptional ratings', () => {
    expect(getRatingLabel(5)).toBe('Exceptional');
    expect(getRatingLabel(4.5)).toBe('Exceptional');
  });
  it('labels excellent ratings', () => {
    expect(getRatingLabel(4)).toBe('Excellent');
    expect(getRatingLabel(4.4)).toBe('Excellent');
  });
  it('labels very good ratings', () => {
    expect(getRatingLabel(3.5)).toBe('Very Good');
  });
  it('labels good ratings', () => {
    expect(getRatingLabel(3)).toBe('Good');
  });
  it('labels fair ratings', () => {
    expect(getRatingLabel(2)).toBe('Fair');
  });
  it('labels poor ratings', () => {
    expect(getRatingLabel(1)).toBe('Poor');
  });
});

/* ── getStatusColor ───────────────────────────────────────── */
describe('getStatusColor()', () => {
  it('returns correct classes for published', () => {
    expect(getStatusColor('published')).toContain('emerald');
  });
  it('returns correct classes for pending', () => {
    expect(getStatusColor('pending')).toContain('amber');
  });
  it('returns fallback for unknown status', () => {
    expect(getStatusColor('unknown')).toContain('slate');
  });
});

/* ── getRoleColor ─────────────────────────────────────────── */
describe('getRoleColor()', () => {
  it('returns purple for admin', () => {
    expect(getRoleColor('admin')).toContain('purple');
  });
  it('returns blue for moderator', () => {
    expect(getRoleColor('moderator')).toContain('blue');
  });
  it('returns fallback for unknown role', () => {
    expect(getRoleColor('alien')).toContain('slate');
  });
});

/* ── buildProductImageUrl ─────────────────────────────────── */
describe('buildProductImageUrl()', () => {
  it('returns image url when provided', () => {
    expect(buildProductImageUrl({ url: 'https://example.com/img.jpg' })).toBe('https://example.com/img.jpg');
  });
  it('returns fallback when image is null', () => {
    expect(buildProductImageUrl(null)).toBe('/placeholder-product.svg');
  });
  it('returns custom fallback', () => {
    expect(buildProductImageUrl(null, '/custom-fallback.svg')).toBe('/custom-fallback.svg');
  });
});
