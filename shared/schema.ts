// Shared schema types for ConfessBox app

// Base types
export interface User {
  id: string;
  full_name?: string;
  email: string;
  avatar_seed: string;
  created_at: string;
  posts_count: number;
  reactions_count: number;
}

export interface Society {
  id: string;
  name: string;
  description?: string;
  icon_name?: string;
  member_count: number;
  is_private: boolean;
  creator_id?: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  society_id?: string;
  title: string;
  content: string;
  category: Category;
  reactions_summary: Record<string, number>;
  comment_count: number;
  view_count: number;
  is_trending: boolean;
  visibility: string;
  created_at: string;
  societyName?: string; // Added from join
  isOwner?: boolean; // Added from frontend logic
  myReactionType?: string; // Added from frontend logic
  reactions?: Record<string, number>; // Added from frontend logic
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  score: number;
  myVote: number;
  created_at: string;
  userId: string; // Duplicate for frontend compatibility
}

// Hashtag types
export interface Hashtag {
  id: string;
  name: string;
  post_count: number;
  created_at: string;
  created_by?: string;
}

export interface PostHashtag {
  id: string;
  post_id: string;
  hashtag_id: string;
  created_at: string;
}

// Extended Post type with hashtags
export interface PostWithHashtags extends Post {
  hashtags?: Hashtag[];
}

// API request/response types for hashtags
export interface CreateHashtagRequest {
  name: string;
  created_by?: string;
}

export interface SearchHashtagsRequest {
  query: string;
  limit?: number;
}

export interface SearchHashtagsResponse {
  hashtags: Hashtag[];
}

export interface GetPostHashtagsRequest {
  post_id: string;
}

export interface GetPostHashtagsResponse {
  hashtags: Hashtag[];
}

export interface ProcessPostHashtagsRequest {
  post_id: string;
  content: string;
  user_id: string;
}

export interface ProcessPostHashtagsResponse {
  hashtags: Hashtag[];
}

// Utility types
export type Category = 'College' | 'Work' | 'Love' | 'Drama' | 'Dark' | 'Funny' | 'Secrets';
export type ReactionType = 'Like' | 'Funny' | 'Supportive' | 'Unbelievable' | 'Thought' | 'Anger';

// Form types
export interface CreatePostRequest {
  title?: string;
  content: string;
  category: Category;
  societyId?: string;
}

export interface CreateCommentRequest {
  post_id: string;
  content: string;
}

// Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  total?: number;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}