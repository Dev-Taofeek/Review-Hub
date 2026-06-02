import { RatingDistribution } from '../types';

export interface RatingStats {
  average: number;
  total: number;
  distribution: RatingDistribution;
  percentages: RatingDistribution;
}

export function calculateRatingStats(ratings: number[]): RatingStats {
  const total = ratings.length;
  const distribution: RatingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  for (const rating of ratings) {
    const r = Math.round(rating) as 1 | 2 | 3 | 4 | 5;
    if (r >= 1 && r <= 5) distribution[r]++;
  }

  const sum = ratings.reduce((acc, r) => acc + r, 0);
  const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;

  const percentages: RatingDistribution = {
    5: total > 0 ? Math.round((distribution[5] / total) * 100) : 0,
    4: total > 0 ? Math.round((distribution[4] / total) * 100) : 0,
    3: total > 0 ? Math.round((distribution[3] / total) * 100) : 0,
    2: total > 0 ? Math.round((distribution[2] / total) * 100) : 0,
    1: total > 0 ? Math.round((distribution[1] / total) * 100) : 0,
  };

  return { average, total, distribution, percentages };
}

export function bayesianRating(
  productAvg: number,
  productCount: number,
  globalAvg: number,
  minVotes = 5
): number {
  return (
    (productCount / (productCount + minVotes)) * productAvg +
    (minVotes / (productCount + minVotes)) * globalAvg
  );
}
