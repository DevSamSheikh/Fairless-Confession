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

export const REACTIONS = ['Empathy', 'Relate', 'Support', 'Respect', 'Strength'] as const;
export type Reaction = typeof REACTIONS[number];

export const REACTION_ICONS: Record<Reaction, string> = {
  'Empathy': 'heart',
  'Relate': 'people',
  'Support': 'handshake',
  'Respect': 'star',
  'Strength': 'fitness',
};

export const RATE_LIMITS = {
  POSTS_PER_DAY: 10,
  COMMENTS_PER_HOUR: 50,
};

export const COLORS = {
  background: '#0F1115', // Minimal, clean, dark
  cardBackground: '#1A1D23', // Slightly lighter than app background
  primary: '#FFFFFF',
  text: '#FFFFFF',
  textSecondary: '#8E9196', // Muted, minimal emphasis
  accent: '#6B5CE7', // Active icons, primary CTA
  border: '#2A2E37',
  success: '#4ADE80',
  error: '#F87171',
  likeActive: '#E0245E', // Active Like Button (Red/Pink)
};
