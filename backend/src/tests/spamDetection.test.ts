import { detectSpam, checkDuplicateContent } from '../utils/spamDetection';

describe('Spam Detection', () => {
  const baseReview = {
    title: 'Great product',
    body: 'This product is really amazing and I love using it every day. Highly recommend!',
    rating: 5,
    userId: 'user-1',
    productId: 'product-1',
  };

  test('legitimate review gets published status', () => {
    const result = detectSpam(baseReview);
    expect(result.suggestedStatus).toBe('published');
    expect(result.isSpam).toBe(false);
    expect(result.spamScore).toBeLessThan(30);
  });

  test('very short body triggers spam flag', () => {
    const result = detectSpam({ ...baseReview, body: 'Good' });
    expect(result.flags).toContain('very_short_review');
    expect(result.spamScore).toBeGreaterThanOrEqual(30);
  });

  test('multiple URLs triggers excessive_links flag', () => {
    const result = detectSpam({
      ...baseReview,
      body: 'Check this out http://spam.com and also http://scam.com for great deals',
    });
    expect(result.flags).toContain('excessive_links');
    expect(result.spamScore).toBeGreaterThanOrEqual(40);
  });

  test('single URL triggers contains_link flag', () => {
    const result = detectSpam({
      ...baseReview,
      body: 'Check out http://example.com for more info about this product',
    });
    expect(result.flags).toContain('contains_link');
  });

  test('repeated characters triggers spam flag', () => {
    const result = detectSpam({
      ...baseReview,
      body: 'AMAZING product!!!!! Definitely buyyyyy this nowwwwww you wonnnnt regret it',
    });
    expect(result.flags).toContain('repeated_characters');
  });

  test('excessive caps triggers spam flag', () => {
    const result = detectSpam({
      ...baseReview,
      body: 'BUY THIS PRODUCT NOW IT IS THE BEST EVER AMAZING QUALITY YOU WONT BELIEVE IT',
    });
    expect(result.flags).toContain('excessive_caps');
  });

  test('suspicious keywords trigger flag', () => {
    const result = detectSpam({
      ...baseReview,
      body: 'Use my discount code and buy now! Limited offer, act fast before it expires',
    });
    expect(result.flags).toContain('suspicious_keywords');
  });

  test('high review velocity triggers flag', () => {
    const result = detectSpam({ ...baseReview, recentReviewCount: 5 });
    expect(result.flags).toContain('high_review_velocity');
  });

  test('review bombing pattern triggers flag', () => {
    const result = detectSpam({
      ...baseReview,
      rating: 1,
      recentReviewCount: 7,
    });
    expect(result.flags).toContain('review_bombing_suspected');
    expect(result.suggestedStatus).toBe('flagged');
  });

  test('highly spammy review gets flagged status', () => {
    const result = detectSpam({
      title: 'buy',
      body: 'http://spam.com http://scam.com buy now discount code click here',
      rating: 1,
      userId: 'user-1',
      productId: 'product-1',
      recentReviewCount: 10,
    });
    expect(result.suggestedStatus).toBe('flagged');
    expect(result.isSpam).toBe(true);
    expect(result.spamScore).toBeGreaterThanOrEqual(70);
  });

  test('moderately suspicious review gets pending status', () => {
    const result = detectSpam({
      title: 'Not bad',
      body: 'ok',
      rating: 3,
      userId: 'user-1',
      productId: 'product-1',
    });
    expect(result.suggestedStatus).toBe('pending');
  });
});

describe('Duplicate Content Detection', () => {
  const existing = [
    'This product is absolutely fantastic. I have been using it for months and it never lets me down.',
    'Average product, does the job but nothing special about it.',
  ];

  test('returns false for unique content', () => {
    const result = checkDuplicateContent(
      'Completely different review with unique thoughts about this amazing item.',
      existing
    );
    expect(result).toBe(false);
  });

  test('returns true for near-identical content', () => {
    const result = checkDuplicateContent(
      'This product is absolutely fantastic. I have been using it for months and it never lets me down.',
      existing
    );
    expect(result).toBe(true);
  });

  test('returns true for slightly modified duplicate', () => {
    const result = checkDuplicateContent(
      'This product is absolutely fantastic! I have been using it for months and it never lets me down.',
      existing
    );
    expect(result).toBe(true);
  });

  test('returns false when no existing reviews', () => {
    const result = checkDuplicateContent('Any review content here', []);
    expect(result).toBe(false);
  });
});
