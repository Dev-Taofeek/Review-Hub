// Pure business-logic tests — no DB, no HTTP

interface ReviewInput {
  rating: number;
  title: string;
  body: string;
  pros?: string[];
  cons?: string[];
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateReviewInput(input: ReviewInput): ValidationResult {
  const errors: string[] = [];

  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    errors.push('Rating must be an integer between 1 and 5');
  }

  const title = input.title?.trim() ?? '';
  if (!title) errors.push('Title is required');
  else if (title.length < 3)  errors.push('Title must be at least 3 characters');
  else if (title.length > 200) errors.push('Title must be at most 200 characters');

  const body = input.body?.trim() ?? '';
  if (!body) errors.push('Review body is required');
  else if (body.length < 10)  errors.push('Body must be at least 10 characters');
  else if (body.length > 5000) errors.push('Body must be at most 5000 characters');

  if (input.pros && input.pros.length > 10) {
    errors.push('Pros must have at most 10 items');
  }
  if (input.cons && input.cons.length > 10) {
    errors.push('Cons must have at most 10 items');
  }

  return { valid: errors.length === 0, errors };
}

describe('Review input validation', () => {
  const valid: ReviewInput = {
    rating: 4,
    title: 'Great product overall',
    body: 'I have been using this for three months and it works perfectly every time.',
  };

  test('valid review passes', () => {
    const result = validateReviewInput(valid);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  describe('rating', () => {
    test.each([1, 2, 3, 4, 5])('accepts valid rating %d', (rating) => {
      expect(validateReviewInput({ ...valid, rating }).valid).toBe(true);
    });

    test.each([0, 6, -1, 10])('rejects out-of-range rating %d', (rating) => {
      const result = validateReviewInput({ ...valid, rating });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Rating'))).toBe(true);
    });

    test('rejects non-integer rating', () => {
      const result = validateReviewInput({ ...valid, rating: 3.5 });
      expect(result.valid).toBe(false);
    });
  });

  describe('title', () => {
    test('rejects empty title', () => {
      const result = validateReviewInput({ ...valid, title: '' });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Title'))).toBe(true);
    });

    test('rejects title under 3 chars', () => {
      const result = validateReviewInput({ ...valid, title: 'ab' });
      expect(result.valid).toBe(false);
    });

    test('rejects title over 200 chars', () => {
      const result = validateReviewInput({ ...valid, title: 'a'.repeat(201) });
      expect(result.valid).toBe(false);
    });

    test('accepts title of exactly 3 chars', () => {
      expect(validateReviewInput({ ...valid, title: 'abc' }).valid).toBe(true);
    });
  });

  describe('body', () => {
    test('rejects body under 10 chars', () => {
      const result = validateReviewInput({ ...valid, body: 'Too short' });
      expect(result.valid).toBe(false);
    });

    test('rejects body over 5000 chars', () => {
      const result = validateReviewInput({ ...valid, body: 'x'.repeat(5001) });
      expect(result.valid).toBe(false);
    });

    test('accepts body of exactly 10 chars', () => {
      expect(validateReviewInput({ ...valid, body: 'Exactly10c' }).valid).toBe(true);
    });
  });

  describe('pros and cons', () => {
    test('accepts 10 pros/cons items', () => {
      const result = validateReviewInput({
        ...valid,
        pros: Array.from({ length: 10 }, (_, i) => `Pro ${i + 1}`),
        cons: Array.from({ length: 10 }, (_, i) => `Con ${i + 1}`),
      });
      expect(result.valid).toBe(true);
    });

    test('rejects more than 10 pros', () => {
      const result = validateReviewInput({
        ...valid,
        pros: Array.from({ length: 11 }, (_, i) => `Pro ${i + 1}`),
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Pros'))).toBe(true);
    });

    test('optional pros/cons are allowed to be absent', () => {
      const { pros, cons, ...rest } = { ...valid, pros: undefined, cons: undefined };
      expect(validateReviewInput(rest).valid).toBe(true);
    });
  });

  test('collects multiple errors at once', () => {
    const result = validateReviewInput({ rating: 0, title: '', body: '' });
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
    expect(result.valid).toBe(false);
  });
});

describe('Review ownership rules', () => {
  function canEditReview(userId: string, reviewOwnerId: string, status: string): boolean {
    if (userId !== reviewOwnerId) return false;
    if (status === 'rejected') return false;
    return true;
  }

  test('owner can edit pending review', () => {
    expect(canEditReview('u1', 'u1', 'pending')).toBe(true);
  });

  test('owner can edit published review', () => {
    expect(canEditReview('u1', 'u1', 'published')).toBe(true);
  });

  test('owner cannot edit rejected review', () => {
    expect(canEditReview('u1', 'u1', 'rejected')).toBe(false);
  });

  test('non-owner cannot edit review', () => {
    expect(canEditReview('u2', 'u1', 'published')).toBe(false);
  });
});
