// Frontend Reaction Types - Production Ready

export interface ReactionRequest {
  postId: string;
  reactionType: string;
}

export interface ReactionResponse {
  success: boolean;
  reactionCount: number;
  currentUserReaction: string | null;
  reactions: Record<string, number>; // reactionType -> count
}

export interface PostWithReactions {
  id: string;
  title: string;
  content: string;
  category: string;
  societyName: string;
  reactionCount: number;
  reactions: Record<string, number>;
  currentUserReaction: string | null;
  commentCount: number;
  createdAt: Date;
  isOwner: boolean;
}

// Store interface for reactions
export interface ReactionState {
  posts: PostWithReactions[];
  trendingPosts: PostWithReactions[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  currentPage: number;
}

// Store actions
export interface ReactionStore {
  // State
  posts: PostWithReactions[];
  trendingPosts: PostWithReactions[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  currentPage: number;
  
  // Actions
  loadFeed: (page?: number, append?: boolean) => Promise<void>;
  loadTrending: () => Promise<void>;
  toggleReaction: (postId: string, reactionType: string) => Promise<void>;
  syncReactionState: (postId: string, response: ReactionResponse) => void;
  refreshFeed: () => void;
}
