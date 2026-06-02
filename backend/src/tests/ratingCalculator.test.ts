import { calculateRatingStats, bayesianRating } from '../utils/ratingCalculator';

describe('Rating Calculator', () => {
  test('calculates correct average for mixed ratings', () => {
    const ratings = [5, 4, 3, 2, 1];
    const stats = calculateRatingStats(ratings);
    expect(stats.average).toBe(3);
    expect(stats.total).toBe(5);
  });

  test('calculates correct distribution', () => {
    const ratings = [5, 5, 4, 3, 1];
    const stats = calculateRatingStats(ratings);
    expect(stats.distribution[5]).toBe(2);
    expect(stats.distribution[4]).toBe(1);
    expect(stats.distribution[3]).toBe(1);
    expect(stats.distribution[2]).toBe(0);
    expect(stats.distribution[1]).toBe(1);
  });

  test('calculates percentage distribution', () => {
    const ratings = [5, 5, 5, 5, 1];
    const stats = calculateRatingStats(ratings);
    expect(stats.percentages[5]).toBe(80);
    expect(stats.percentages[1]).toBe(20);
    expect(stats.percentages[3]).toBe(0);
  });

  test('returns zeros for empty rating array', () => {
    const stats = calculateRatingStats([]);
    expect(stats.average).toBe(0);
    expect(stats.total).toBe(0);
    expect(stats.distribution[5]).toBe(0);
  });

  test('handles single rating', () => {
    const stats = calculateRatingStats([4]);
    expect(stats.average).toBe(4);
    expect(stats.total).toBe(1);
    expect(stats.distribution[4]).toBe(1);
    expect(stats.percentages[4]).toBe(100);
  });

  test('rounds average to one decimal', () => {
    const stats = calculateRatingStats([5, 4, 4]);
    expect(stats.average).toBe(4.3);
  });

  test('handles all same ratings', () => {
    const stats = calculateRatingStats([5, 5, 5, 5, 5]);
    expect(stats.average).toBe(5);
    expect(stats.distribution[5]).toBe(5);
    expect(stats.percentages[5]).toBe(100);
  });
});

describe('Bayesian Rating', () => {
  test('favors global average when product has few reviews', () => {
    // (1/(1+5))*5 + (5/(1+5))*3.5 = 0.833 + 2.917 = 3.75
    const result = bayesianRating(5, 1, 3.5, 5);
    expect(result).toBeCloseTo(3.75, 2);
  });

  test('favors product average when product has many reviews', () => {
    const result = bayesianRating(5, 100, 3.5, 5);
    expect(result).toBeGreaterThan(4.8);
  });

  test('equals global average when product has zero reviews', () => {
    const result = bayesianRating(0, 0, 3.5, 5);
    expect(result).toBe(3.5);
  });
});
