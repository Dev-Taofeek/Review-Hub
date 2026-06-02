import { ReportReason, ReportStatus } from '../types';

// Isolated unit tests for report business logic (no DB calls)

const VALID_REASONS: ReportReason[] = [
  'spam', 'abuse', 'hate_speech', 'fake_review',
  'misleading_content', 'offensive_language', 'other',
];

const VALID_STATUSES: ReportStatus[] = ['pending', 'reviewed', 'resolved', 'dismissed'];

function validateReportReason(reason: string): boolean {
  return VALID_REASONS.includes(reason as ReportReason);
}

function validateReportStatus(status: string): boolean {
  return VALID_STATUSES.includes(status as ReportStatus);
}

function canReport(reporterId: string, reviewAuthorId: string, existingReports: Array<{ reporter_id: string; review_id: string }>, reviewId: string): { allowed: boolean; reason?: string } {
  if (reporterId === reviewAuthorId) {
    return { allowed: false, reason: 'Cannot report your own review' };
  }
  const alreadyReported = existingReports.some(
    (r) => r.reporter_id === reporterId && r.review_id === reviewId
  );
  if (alreadyReported) {
    return { allowed: false, reason: 'Already reported' };
  }
  return { allowed: true };
}

describe('Report Creation Rules', () => {
  test('valid reason passes validation', () => {
    VALID_REASONS.forEach((reason) => {
      expect(validateReportReason(reason)).toBe(true);
    });
  });

  test('invalid reason fails validation', () => {
    expect(validateReportReason('nonsense')).toBe(false);
    expect(validateReportReason('')).toBe(false);
    expect(validateReportReason('SPAM')).toBe(false); // case-sensitive
  });

  test('valid status passes validation', () => {
    VALID_STATUSES.forEach((status) => {
      expect(validateReportStatus(status)).toBe(true);
    });
  });

  test('user cannot report own review', () => {
    const result = canReport('user-1', 'user-1', [], 'review-1');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Cannot report your own review');
  });

  test('user can report others review', () => {
    const result = canReport('user-1', 'user-2', [], 'review-1');
    expect(result.allowed).toBe(true);
  });

  test('prevents duplicate reports from same user', () => {
    const existing = [{ reporter_id: 'user-1', review_id: 'review-1' }];
    const result = canReport('user-1', 'user-2', existing, 'review-1');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Already reported');
  });

  test('allows reporting different reviews', () => {
    const existing = [{ reporter_id: 'user-1', review_id: 'review-1' }];
    const result = canReport('user-1', 'user-2', existing, 'review-2');
    expect(result.allowed).toBe(true);
  });

  test('different users can report same review', () => {
    const existing = [{ reporter_id: 'user-1', review_id: 'review-1' }];
    const result = canReport('user-2', 'user-3', existing, 'review-1');
    expect(result.allowed).toBe(true);
  });
});

describe('Auto-Flag Logic', () => {
  function shouldAutoFlag(reportCount: number, threshold = 3): boolean {
    return reportCount >= threshold;
  }

  test('auto-flags review with 3+ reports', () => {
    expect(shouldAutoFlag(3)).toBe(true);
    expect(shouldAutoFlag(5)).toBe(true);
  });

  test('does not auto-flag with fewer than 3 reports', () => {
    expect(shouldAutoFlag(0)).toBe(false);
    expect(shouldAutoFlag(1)).toBe(false);
    expect(shouldAutoFlag(2)).toBe(false);
  });
});
