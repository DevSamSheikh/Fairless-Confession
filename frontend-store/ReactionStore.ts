// Frontend Reaction Store - Production Ready
// NO OPTIMISTIC UPDATES - Backend is single source of truth

import { create } from 'zustand';
import { ReactionState, ReactionStore, PostWithReactions, ReactionResponse } from '../frontend-types/ReactionTypes';

interface ReactionStoreImpl extends ReactionStore {
  // Private state setters
  setPosts: (posts: PostWithReactions[]) => void;
  setTrendingPosts: (posts: PostWithReactions[]) => void;
  setLoading: (loading: boolean) => void;
  setLoadingMore: (loadingMore: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setCurrentPage: (page: number) => void;
}

export const useReactionStore = create<ReactionStoreImpl>((set, get) => ({
  // Initial state
  posts: [],
  trendingPosts: [],
  loading: false,
  loadingMore: false,
  hasMore: false,
  currentPage: 0,

  // State setters
  setPosts: (posts) => set({ posts, trendingPosts: posts }),
  setTrendingPosts: (trendingPosts) => set({ trendingPosts }),
  setLoading: (loading) => set({ loading }),
  setLoadingMore: (loadingMore) => set({ loadingMore }),
  setHasMore: (hasMore) => set({ hasMore }),
  setCurrentPage: (currentPage) => set({ currentPage }),

  // Load feed with user-specific reaction data
  loadFeed: async (page = 0, append = false) => {
    const pageSize = 10;
    
    if (append) {
      set({ loadingMore: true });
    } else {
      set({ loading: true, currentPage: 0, posts: [] });
    }

    try {
      // API call to get posts with reaction data
      const response = await fetch(`/api/posts/feed?page=${page}&size=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load feed');
      }

      const data = await response.json();
      const posts: PostWithReactions[] = data.posts.map(transformPostData);

      const hasMore = posts.length === pageSize;

      if (append) {
        set((state) => ({
          posts: [...state.posts, ...posts],
          loadingMore: false,
          hasMore,
          currentPage: page,
        }));
      } else {
        set({ posts, loading: false, hasMore, currentPage: 0 });
      }

    } catch (error) {
      console.error('Failed to load feed:', error);
      set({ loading: false, loadingMore: false });
    }
  },

  // Load trending posts
  loadTrending: async () => {
    try {
      const response = await fetch('/api/posts/trending', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load trending posts');
      }

      const data = await response.json();
      const posts: PostWithReactions[] = data.posts.map(transformPostData);

      set({ trendingPosts: posts });

    } catch (error) {
      console.error('Failed to load trending posts:', error);
    }
  },

  // Toggle reaction - NO OPTIMISTIC UPDATES
  toggleReaction: async (postId: string, reactionType: string) => {
    try {
      // Show loading state for this specific post
      const originalPosts = get().posts;
      const originalTrendingPosts = get().trendingPosts;

      // Find the post to show immediate feedback (but don't change counts)
      const updatePostLoading = (posts: PostWithReactions[]) =>
        posts.map(post =>
          post.id === postId
            ? { ...post, _isUpdating: true }
            : post
        );

      set((state) => ({
        posts: updatePostLoading(state.posts),
        trendingPosts: updatePostLoading(state.trendingPosts),
      }));

      // Make API call to backend
      const response = await fetch('/api/reactions/toggle', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postId, reactionType })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle reaction');
      }

      const data: ReactionResponse = await response.json();

      // Update state with server response ONLY
      get().syncReactionState(postId, data);

    } catch (error) {
      console.error('Failed to toggle reaction:', error);
      
      // Revert loading state on error
      const revertLoading = (posts: PostWithReactions[]) =>
        posts.map(post =>
          post.id === postId
            ? { ...post, _isUpdating: false }
            : post
        );

      set((state) => ({
        posts: revertLoading(state.posts),
        trendingPosts: revertLoading(state.trendingPosts),
      }));
    }
  },

  // Sync reaction state with server response
  syncReactionState: (postId: string, response: ReactionResponse) => {
    const updatePostReaction = (posts: PostWithReactions[]) =>
      posts.map(post =>
        post.id === postId
          ? {
              ...post,
              reactionCount: response.reactionCount,
              currentUserReaction: response.currentUserReaction,
              reactions: response.reactions,
              _isUpdating: false,
            }
          : post
      );

    set((state) => ({
      posts: updatePostReaction(state.posts),
      trendingPosts: updatePostReaction(state.trendingPosts),
    }));
  },

  // Refresh feed
  refreshFeed: async () => {
    await get().loadFeed(0, false);
    await get().loadTrending();
  },
}));

// Helper functions
function getAuthToken(): string {
  // Get auth token from storage
  return localStorage.getItem('authToken') || '';
}

function transformPostData(data: any): PostWithReactions {
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    category: data.category || 'General',
    societyName: data.societyName || '',
    reactionCount: data.reactionCount || 0,
    reactions: data.reactions || {},
    currentUserReaction: data.currentUserReaction || null,
    commentCount: data.commentCount || 0,
    createdAt: new Date(data.createdAt),
    isOwner: data.isOwner || false,
  };
}

// Extended PostWithReactions interface for loading state
declare module '../frontend-types/ReactionTypes' {
  interface PostWithReactions {
    _isUpdating?: boolean;
  }
}
