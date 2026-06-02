import { SpamCheckResult, ReviewStatus } from '../types';

const PROFANITY_LIST = ['spam', 'scam', 'fake', 'fraud'];

const SUSPICIOUS_KEYWORDS = [
  'click here', 'buy now', 'limited offer', 'act fast', 'free money',
  'guaranteed', 'winner', 'prize', 'discount code', 'coupon',
  'whatsapp', 'telegram', 'contact me', 'dm me', 'follow me',
];

const URL_PATTERN = /https?:\/\/[^\s]+|www\.[^\s]+/gi;
const REPEATED_CHARS_PATTERN = /(.)\1{4,}/g;
const EXCESSIVE_CAPS_PATTERN = /[A-Z]{5,}/g;

interface ReviewData {
  title: string;
  body: string;
  rating: number;
  userId: string;
  productId: string;
  recentReviewCount?: number;
}

export function detectSpam(data: ReviewData): SpamCheckResult {
  const flags: string[] = [];
  let spamScore = 0;

  const fullText = `${data.title} ${data.body}`.toLowerCase();

  // 1. Very short review body
  if (data.body.trim().length < 20) {
    flags.push('very_short_review');
    spamScore += 30;
  }

  // 2. Link detection
  const urlMatches = fullText.match(URL_PATTERN) || [];
  if (urlMatches.length >= 2) {
    flags.push('excessive_links');
    spamScore += 40;
  } else if (urlMatches.length === 1) {
    flags.push('contains_link');
    spamScore += 15;
  }

  // 3. Repeated characters
  if (REPEATED_CHARS_PATTERN.test(fullText)) {
    flags.push('repeated_characters');
    spamScore += 20;
  }

  // 4. Excessive caps
  const capsMatches = data.body.match(EXCESSIVE_CAPS_PATTERN) || [];
  if (capsMatches.length > 2) {
    flags.push('excessive_caps');
    spamScore += 15;
  }

  // 5. Profanity check
  const hasProfanity = PROFANITY_LIST.some((word) => fullText.includes(word));
  if (hasProfanity) {
    flags.push('profanity_detected');
    spamScore += 25;
  }

  // 6. Suspicious keywords
  const suspiciousKeywordsFound = SUSPICIOUS_KEYWORDS.filter((kw) =>
    fullText.includes(kw)
  );
  if (suspiciousKeywordsFound.length >= 2) {
    flags.push('suspicious_keywords');
    spamScore += 35;
  } else if (suspiciousKeywordsFound.length === 1) {
    flags.push('suspicious_keyword');
    spamScore += 15;
  }

  // 7. Repeated words (more than 30% of words are the same word)
  const words = fullText.split(/\s+/).filter((w) => w.length > 2);
  if (words.length > 0) {
    const wordCounts = words.reduce<Record<string, number>>((acc, w) => {
      acc[w] = (acc[w] || 0) + 1;
      return acc;
    }, {});
    const maxRepeat = Math.max(...Object.values(wordCounts));
    if (maxRepeat / words.length > 0.3 && words.length > 5) {
      flags.push('word_repetition');
      spamScore += 25;
    }
  }

  // 8. Review bombing: same user rating 1 star on multiple products quickly
  if (data.rating === 1 && data.recentReviewCount && data.recentReviewCount >= 5) {
    flags.push('review_bombing_suspected');
    spamScore += 50;
  }

  // 9. Too many reviews from same user in short time
  if (data.recentReviewCount && data.recentReviewCount >= 3) {
    flags.push('high_review_velocity');
    spamScore += 20;
  }

  // 10. Extremely generic filler
  const fillerPhrases = ['good product', 'nice product', 'ok product', 'great product', 'bad product'];
  const isGenericFiller = fillerPhrases.some((p) => fullText.trim() === p);
  if (isGenericFiller) {
    flags.push('generic_filler');
    spamScore += 30;
  }

  // Cap at 100
  spamScore = Math.min(100, spamScore);

  const isSpam = spamScore >= 70;
  let suggestedStatus: ReviewStatus;
  if (spamScore >= 70) {
    suggestedStatus = 'flagged';
  } else if (spamScore >= 30) {
    suggestedStatus = 'pending';
  } else {
    suggestedStatus = 'published';
  }

  return { isSpam, spamScore, flags, suggestedStatus };
}

export function checkDuplicateContent(
  newBody: string,
  existingBodies: string[]
): boolean {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/\s+/g, ' ').trim();
  const normalized = normalize(newBody);

  return existingBodies.some((existing) => {
    const existingNorm = normalize(existing);
    return similarity(normalized, existingNorm) > 0.85;
  });
}

function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  const editDistance = levenshtein(longer, shorter);

  return (longer.length - editDistance) / longer.length;
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b.charAt(i - 1) === a.charAt(j - 1)
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
    }
  }
  return matrix[b.length][a.length];
}
