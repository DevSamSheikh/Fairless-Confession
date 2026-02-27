/**
 * Content filter per ConfessBox Safety & Protection Policy.
 * Blocks: abusive/vulgar language, external links, and enforces safe content.
 */

const BLOCKED_WORDS = new Set([
  'sex', 'sexual', 'boobs', 'boob', 'dick', 'penis', 'vagina', 'pussy', 'ass', 'asshole',
  'fuck', 'fucking', 'fucker', 'shit', 'shitty', 'bitch', 'bastard', 'whore', 'slut',
  'blowjob', 'blow job', 'nudes', 'nude', 'naked',
  'nigger', 'nigga', 'fag', 'faggot', 'retard', 'rape', 'raping', 'pedophile', 'pedo',
  'kill yourself', 'kys', 'hitler', 'nazi',
  'drugs', 'cocaine', 'heroin', 'meth'
]);

/** Sorted by length descending so longer phrases match first */
const BLOCKED_SORTED = [...BLOCKED_WORDS].sort((a, b) => b.length - a.length);

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// URL detection (no global flag here to avoid lastIndex state issues when using .test())
const URL_REGEX = /https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|org|net|io|co|me)[^\s]*/i;

// URL masking (global) for sanitization
const URL_MASK_REGEX = /https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|org|net|io|co|me)[^\s]*/gi;

// Rough detection for phone numbers (sequence of 8+ digits, allowing spaces / dashes / brackets)
const PHONE_REGEX = /\+?\d[\d\s\-().]{7,}\d/;

// Detection for handles / usernames like @username
const HANDLE_REGEX = /@[A-Za-z0-9_.]{3,}/;

function normalizeForCheck(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
}

/**
 * Strict whole-word / whole-phrase match.
 * IMPORTANT: do NOT do substring matching like "penis".includes("is") (causes false positives).
 * Returns the matched word/phrase (normalized) or null.
 */
function findBlocked(text: string): string | null {
  const normalized = (' ' + normalizeForCheck(text).trim() + ' ').replace(/\s+/g, ' ');
  if (normalized.trim().length === 0) return null;

  for (const blocked of BLOCKED_SORTED) {
    const needle = ' ' + blocked + ' ';
    if (normalized.includes(needle)) return blocked;
  }
  return null;
}

function containsUrl(text: string): boolean {
  return URL_REGEX.test(text);
}

function containsSensitiveIdentity(text: string): boolean {
  if (!text) return false;
  if (PHONE_REGEX.test(text)) return true;
  if (HANDLE_REGEX.test(text)) return true;
  return false;
}

/** Replaces every blocked word (word-boundary, case-insensitive) with asterisks of same length */
export function sanitizeText(text: string): string {
  let out = text;

  // 1. Mask blocked words per policy (e.g. "sex" -> "***", "boobs" -> "*****")
  for (const word of BLOCKED_SORTED) {
    const re = new RegExp('\\b' + escapeRegex(word) + '\\b', 'gi');
    out = out.replace(re, (match) => '*'.repeat(match.length));
  }

  // 2. Mask phone numbers and long digit sequences (privacy protection)
  out = out.replace(PHONE_REGEX, (match) => '*'.repeat(match.length));

  // 3. Mask @usernames / handles (keep @, hide identifier)
  out = out.replace(HANDLE_REGEX, (match) => '@' + '*'.repeat(Math.max(0, match.length - 1)));

  // 4. Mask URLs / domains completely
  out = out.replace(URL_MASK_REGEX, (match) => '*'.repeat(match.length));

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
    return {
      allowed: false,
      error: 'External links are not allowed. Remove any URLs.',
      sanitizedTitle: sanitizeText(title || ''),
      sanitizedContent: sanitizeText(content || ''),
    };
  }

  // Block phone numbers, usernames and similar identity leaks in either title or content
  if (containsSensitiveIdentity(combined)) {
    return {
      allowed: false,
      error: 'Sharing phone numbers, usernames or personal identifiers is not allowed. You can edit it or post a filtered version.',
      sanitizedTitle: sanitizeText(title || ''),
      sanitizedContent: sanitizeText(content || ''),
    };
  }

  const blockedTitle = findBlocked(title || '');
  if (blockedTitle) {
    return {
      allowed: false,
      error: `Restricted word/phrase detected: "${blockedTitle}". You can edit it or post a filtered version.`,
      sanitizedTitle: sanitizeText(title || ''),
      sanitizedContent: sanitizeText(content || ''),
    };
  }

  const blockedContent = findBlocked(content || '');
  if (blockedContent) {
    return {
      allowed: false,
      error: `Restricted word/phrase detected: "${blockedContent}". You can edit it or post a filtered version.`,
      sanitizedTitle: sanitizeText(title || ''),
      sanitizedContent: sanitizeText(content || ''),
    };
  }

  return { allowed: true };
}
