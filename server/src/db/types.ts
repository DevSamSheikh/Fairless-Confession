export type Category = 'College' | 'Work' | 'Love' | 'Drama' | 'Dark' | 'Funny' | 'Secrets';
export type MemberRole = 'Member' | 'Moderator' | 'Admin';
export type ReactionType = 'Like' | 'Funny' | 'Supportive' | 'Unbelievable' | 'Thought' | 'Anger';

export interface User {
  id: string;
  full_name: string | null;
  email: string;
  identity_id: string;
  avatar_seed: string;
  user_id_custom: string | null;
  created_at: string;
  posts_count: number;
  reactions_count: number;
  sign_in_dates?: string[];
}

export interface Society {
  id: string;
  name: string;
  description: string | null;
  icon_name: string | null;
  member_count: number;
  is_private: boolean;
  creator_id: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  society_id: string | null;
  title: string;
  content: string;
  category: Category;
  reactions_summary: Record<string, number>;
  comment_count: number;
  view_count: number;
  is_trending: boolean;
  visibility: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface SocietyMember {
  id: string;
  user_id: string;
  society_id: string;
  role: MemberRole;
  joined_at: string;
}
