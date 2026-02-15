/**
 * Content filter per ConfessBox Safety & Protection Policy.
 * Blocks: abusive/vulgar language, external links, and enforces safe content.
 */

const BLOCKED_WORDS = new Set([
  'sex', 'sexual', 'boobs', 'boob', 'dick', 'penis', 'vagina', 'pussy', 'ass', 'asshole',
  'fuck', 'fucking', 'fucker', 'shit', 'shitty', 'bitch', 'bastard', 'whore', 'slut',
  'blowjob', 'blow job', 'nudes', 'nude', 'naked',
  'nigger', 'nigga', 'fag', 'faggot', 'retard', 'rape', 'raping', 'pedophile', 'pedo',
  'kill yourself', 'kys', 'die', 'hate', 'hitler', 'nazi',
  'drugs', 'cocaine', 'heroin', 'meth'
]);

/** Sorted by length descending so longer phrases match first */
const BLOCKED_SORTED = [...BLOCKED_WORDS].sort((a, b) => b.length - a.length);

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const URL_REGEX = /https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|org|net|io|co|me)[^\s]*/gi;

function normalizeForCheck(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
}

function containsBlockedWord(text: string): { blocked: boolean; word?: string } {
  const normalized = normalizeForCheck(text);
  const words = normalized.split(/\s+/);
  for (const word of words) {
    if (word.length < 2) continue;
    if (BLOCKED_WORDS.has(word)) return { blocked: true, word };
    for (const blocked of BLOCKED_WORDS) {
      if (word.includes(blocked) || blocked.includes(word)) return { blocked: true, word: blocked };
    }
  }
  return { blocked: false };
}

function containsUrl(text: string): boolean {
  return URL_REGEX.test(text);
}

/** Replaces every blocked word (word-boundary, case-insensitive) with asterisks of same length */
export function sanitizeText(text: string): string {
  let out = text;
  for (const word of BLOCKED_SORTED) {
    const re = new RegExp('\\b' + escapeRegex(word) + '\\b', 'gi');
    out = out.replace(re, (match) => '*'.repeat(match.length));
  }
  return out;
}

export interface FilterResult {
  allowed: boolean;
  error?: string;
  sanitizedTitle?: string;
  sanitizedContent?: string;
}

export function filterPostContent(title: string, content: string): FilterResult {
  const combined = `${title || ''} ${content || ''}`.trim();
  if (!combined) return { allowed: false, error: 'Post cannot be empty' };

  if (containsUrl(combined)) {
    return { allowed: false, error: 'External links are not allowed. Remove any URLs.' };
  }

  const titleCheck = containsBlockedWord(title || '');
  if (titleCheck.blocked) {
    return {
      allowed: false,
      error: 'Your content contains language that isn\'t allowed. You can edit it or post a filtered version.',
      sanitizedTitle: sanitizeText(title || ''),
      sanitizedContent: sanitizeText(content || ''),
    };
  }

  const contentCheck = containsBlockedWord(content || '');
  if (contentCheck.blocked) {
    return {
      allowed: false,
      error: 'Your content contains language that isn\'t allowed. You can edit it or post a filtered version.',
      sanitizedTitle: sanitizeText(title || ''),
      sanitizedContent: sanitizeText(content || ''),
    };
  }

  return { allowed: true };
}
