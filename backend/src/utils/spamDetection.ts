import { SpamCheckResult, ReviewStatus } from '../types';

/* ── Spam score thresholds ──────────────────────────── */
const SCORE_AUTO_PUBLISH = 70;  // below this → published immediately
const SCORE_FLAG         = 90;  // at or above this → flagged for urgent review
// Between SCORE_AUTO_PUBLISH and SCORE_FLAG → pending (admin review)

/* ── Scoring weights ────────────────────────────────── */
const SCORE_SHORT_BODY         = 30;
const SCORE_MULTIPLE_LINKS     = 40;
const SCORE_ONE_LINK           = 15;
const SCORE_REPEATED_CHARS     = 20;
const SCORE_EXCESSIVE_CAPS     = 15;
const SCORE_PROFANITY          = 25;
const SCORE_MULTI_KEYWORDS     = 35;
const SCORE_ONE_KEYWORD        = 15;
const SCORE_WORD_REPETITION    = 25;
const SCORE_REVIEW_BOMBING     = 50;
const SCORE_HIGH_VELOCITY      = 20;
const SCORE_GENERIC_FILLER     = 30;

const MIN_BODY_LENGTH          = 20;
const WORD_REPETITION_RATIO    = 0.3;
const WORD_REPETITION_MIN_WORDS= 5;
const REVIEW_BOMB_RATING       = 1;
const REVIEW_BOMB_THRESHOLD    = 5;
const HIGH_VELOCITY_THRESHOLD  = 3;
const DUPLICATE_SIMILARITY     = 0.85;

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
  if (data.body.trim().length < MIN_BODY_LENGTH) {
    flags.push('very_short_review');
    spamScore += SCORE_SHORT_BODY;
  }

  // 2. Link detection
  const urlMatches = fullText.match(URL_PATTERN) || [];
  if (urlMatches.length >= 2) {
    flags.push('excessive_links');
    spamScore += SCORE_MULTIPLE_LINKS;
  } else if (urlMatches.length === 1) {
    flags.push('contains_link');
    spamScore += SCORE_ONE_LINK;
  }

  // 3. Repeated characters
  if (REPEATED_CHARS_PATTERN.test(fullText)) {
    flags.push('repeated_characters');
    spamScore += SCORE_REPEATED_CHARS;
  }

  // 4. Excessive caps
  const capsMatches = data.body.match(EXCESSIVE_CAPS_PATTERN) || [];
  if (capsMatches.length > 2) {
    flags.push('excessive_caps');
    spamScore += SCORE_EXCESSIVE_CAPS;
  }

  // 5. Profanity check
  const hasProfanity = PROFANITY_LIST.some((word) => fullText.includes(word));
  if (hasProfanity) {
    flags.push('profanity_detected');
    spamScore += SCORE_PROFANITY;
  }

  // 6. Suspicious keywords
  const suspiciousKeywordsFound = SUSPICIOUS_KEYWORDS.filter((kw) => fullText.includes(kw));
  if (suspiciousKeywordsFound.length >= 2) {
    flags.push('suspicious_keywords');
    spamScore += SCORE_MULTI_KEYWORDS;
  } else if (suspiciousKeywordsFound.length === 1) {
    flags.push('suspicious_keyword');
    spamScore += SCORE_ONE_KEYWORD;
  }

  // 7. Repeated words — more than WORD_REPETITION_RATIO of words are the same
  const words = fullText.split(/\s+/).filter((w) => w.length > 2);
  if (words.length > 0) {
    const wordCounts = words.reduce<Record<string, number>>((acc, w) => {
      acc[w] = (acc[w] || 0) + 1;
      return acc;
    }, {});
    const maxRepeat = Math.max(...Object.values(wordCounts));
    if (maxRepeat / words.length > WORD_REPETITION_RATIO && words.length > WORD_REPETITION_MIN_WORDS) {
      flags.push('word_repetition');
      spamScore += SCORE_WORD_REPETITION;
    }
  }

  // 8. Review bombing: low rating + many recent reviews in short window
  if (data.rating === REVIEW_BOMB_RATING && data.recentReviewCount && data.recentReviewCount >= REVIEW_BOMB_THRESHOLD) {
    flags.push('review_bombing_suspected');
    spamScore += SCORE_REVIEW_BOMBING;
  }

  // 9. High velocity: too many reviews submitted recently
  if (data.recentReviewCount && data.recentReviewCount >= HIGH_VELOCITY_THRESHOLD) {
    flags.push('high_review_velocity');
    spamScore += SCORE_HIGH_VELOCITY;
  }

  // 10. Extremely generic filler phrases
  const fillerPhrases = ['good product', 'nice product', 'ok product', 'great product', 'bad product'];
  const isGenericFiller = fillerPhrases.some((p) => fullText.trim() === p);
  if (isGenericFiller) {
    flags.push('generic_filler');
    spamScore += SCORE_GENERIC_FILLER;
  }

  spamScore = Math.min(100, spamScore);

  const isSpam = spamScore >= SCORE_AUTO_PUBLISH;
  let suggestedStatus: ReviewStatus;
  if (spamScore >= SCORE_FLAG) {
    suggestedStatus = 'flagged';   // Severe — urgent admin attention
  } else if (spamScore >= SCORE_AUTO_PUBLISH) {
    suggestedStatus = 'pending';   // Suspicious — hold for admin review
  } else {
    suggestedStatus = 'published'; // Clean — auto-publish
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
    return similarity(normalized, existingNorm) > DUPLICATE_SIMILARITY;
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
