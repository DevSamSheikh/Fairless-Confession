export const CATEGORIES = [
  'College',
  'Work',
  'Love',
  'Drama',
  'Dark',
  'Funny',
  'Secrets',
] as const;

export type Category = typeof CATEGORIES[number];

export const REACTIONS = ['❤️', '😮', '😢', '😡', '😂'] as const;
export type Reaction = typeof REACTIONS[number];

export const RATE_LIMITS = {
  POSTS_PER_DAY: 10,
  COMMENTS_PER_HOUR: 50,
};

export const COLORS = {
  background: '#0a0a1a',
  cardBackground: '#1a1a2e',
  primary: '#6b5ce7',
  secondary: '#9d4edd',
  accent: '#f72585',
  text: '#ffffff',
  textSecondary: '#a0a0b0',
  border: '#2a2a4e',
  success: '#00ff88',
  error: '#ff4444',
};
