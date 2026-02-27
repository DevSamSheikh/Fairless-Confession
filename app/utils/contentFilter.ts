// Client-side content filtering aligned with backend policy.
// Used for live soft filtering while typing and strict validation before submit.

const BLOCKED_WORDS = new Set([
  'sex', 'sexual', 'boobs', 'boob', 'dick', 'penis', 'vagina', 'pussy', 'ass', 'asshole',
  'fuck', 'fucking', 'fucker', 'shit', 'shitty', 'bitch', 'bastard', 'whore', 'slut',
  'blowjob', 'blow job', 'nudes', 'nude', 'naked',
  'nigger', 'nigga', 'fag', 'faggot', 'retard', 'rape', 'raping', 'pedophile', 'pedo',
  'kill yourself', 'kys', 'hitler', 'nazi',
  'drugs', 'cocaine', 'heroin', 'meth',
]);

const BLOCKED_SORTED = [...BLOCKED_WORDS].sort((a, b) => b.length - a.length);

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// URL masking (no detection needed on client, we only care if sanitization changes text)
const URL_MASK_REGEX = /https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|org|net|io|co|me)[^\s]*/gi;

// Rough detection for phone numbers
const PHONE_REGEX = /\+?\d[\d\s\-().]{7,}\d/;

// Detection for @handles / usernames
const HANDLE_REGEX = /@[A-Za-z0-9_.]{3,}/;

function normalizeForCheck(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
}

function containsBlockedWord(text: string): boolean {
  const normalized = normalizeForCheck(text);
  const words = normalized.split(/\s+/);
  for (const word of words) {
    if (word.length < 2) continue;
    if (BLOCKED_WORDS.has(word)) return true;
    for (const blocked of BLOCKED_WORDS) {
      if (word.includes(blocked) || blocked.includes(word)) return true;
    }
  }
  return false;
}

/** Final sanitization used for both soft filter and final filtered submit */
export function sanitizeText(text: string): string {
  let out = text;

  // 1. Mask blocked words per policy
  for (const word of BLOCKED_SORTED) {
    const re = new RegExp('\\b' + escapeRegex(word) + '\\b', 'gi');
    out = out.replace(re, (match) => '*'.repeat(match.length));
  }

  // 2. Mask phone numbers and long digit sequences
  out = out.replace(PHONE_REGEX, (match) => '*'.repeat(match.length));

  // 3. Mask @usernames / handles (keep @, hide identifier)
  out = out.replace(HANDLE_REGEX, (match) => '@' + '*'.repeat(Math.max(0, match.length - 1)));

  // 4. Mask URLs / domains completely
  out = out.replace(URL_MASK_REGEX, (match) => '*'.repeat(match.length));

  return out;
}

export interface ScanResult {
  hasIssues: boolean;
  sanitizedTitle: string;
  sanitizedContent: string;
}

/**
 * Live filter for while the user is typing.
 * This is a soft filter – it only transforms what the user sees and what we store locally.
 */
export function softFilterInput(text: string): string {
  if (!text) return text;
  return sanitizeText(text);
}

/**
 * Deep validation before submit.
 * Returns whether there are any issues and the fully sanitized versions.
 */
export function scanPostContent(title: string, content: string): ScanResult {
  // Normalize whitespace for comparison (trim both before comparing)
  const safeTitle = (title || '').trim();
  const safeContent = (content || '').trim();
  const combined = `${safeTitle} ${safeContent}`.trim();

  if (!combined) {
    return {
      hasIssues: false,
      sanitizedTitle: safeTitle,
      sanitizedContent: safeContent,
    };
  }

  // Sanitize the normalized text
  const sanitizedTitle = sanitizeText(safeTitle);
  const sanitizedContent = sanitizeText(safeContent);

  // Only treat as an issue if sanitization would actually change what the user sees.
  // Since softFilterInput already filters as they type, if the text is already clean,
  // sanitizeText will return the same text → hasIssues = false → post directly.
  const hasIssues = sanitizedTitle !== safeTitle || sanitizedContent !== safeContent;

  return { hasIssues, sanitizedTitle, sanitizedContent };
}

