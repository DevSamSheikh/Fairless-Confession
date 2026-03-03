import { create } from 'zustand';
import { Category } from '../utils/constants';
import { getHomeFeed, getTrendingFeed, type HomePost } from '../api/home';

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  title?: string;
  content: string;
  category: Category;
  societyName?: string;
  reactions: Record<string, number>;
  commentCount: number;
  createdAt: Date;
  comments?: Comment[];
  isOwner?: boolean;
  myReactionType?: string | null;
}

// Keep reaction keys aligned with backend enum values
export type PostReaction = 'Like' | 'Funny' | 'Supportive' | 'Unbelievable' | 'Thought' | 'Anger';

interface FeedState {
  posts: Post[];
  trendingPosts: Post[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  currentPage: number;
  setPosts: (posts: Post[]) => void;
  setTrendingPosts: (posts: Post[]) => void;
  setLoading: (loading: boolean) => void;
  setLoadingMore: (loadingMore: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  appendPosts: (posts: Post[]) => void;
  addReaction: (postId: string, reaction: string) => void;
  syncReactionState: (postId: string, summary: Record<string, number>, myReactionType: string | null) => void;
  deletePost: (postId: string) => void;
  updatePost: (postId: string, content: string) => void;
  refreshFeed: () => void;
  loadFeed: (page?: number, append?: boolean) => Promise<void>;
  loadTrending: () => Promise<void>;
}

const dummyComments: Comment[] = [
  { id: 'c1', content: 'This is so relatable!', createdAt: new Date(Date.now() - 1800000) },
  { id: 'c2', content: 'Stay strong, things will get better.', createdAt: new Date(Date.now() - 900000) },
];

const dummyPosts: Post[] = [
  {
    id: '1',
    title: 'Group project nightmare',
    content: 'I secretly hate group projects but always end up doing all the work anyway. It\'s so frustrating when people just slack off.',
    category: 'College',
    societyName: 'Midnight Society',
    reactions: { Like: 234, Supportive: 45, Thought: 12, Anger: 89, Funny: 156 },
    commentCount: 67,
    createdAt: new Date(Date.now() - 3600000),
    comments: dummyComments,
    isOwner: true,
  },
  {
    id: '2',
    title: 'Beach work life',
    content: 'My boss thinks I work from home but I actually work from the beach most days. The view is amazing and I\'m more productive here.',
    category: 'Work',
    reactions: { Like: 567, Supportive: 123, Thought: 8, Anger: 34, Funny: 445 },
    commentCount: 89,
    createdAt: new Date(Date.now() - 7200000),
    comments: dummyComments,
    isOwner: false,
  },
  {
    id: '3',
    title: 'Secret crush',
    content: 'Still in love with someone who doesn\'t even know I exist. I see them every day and my heart just melts.',
    category: 'Love',
    reactions: { Like: 890, Supportive: 23, Thought: 456, Anger: 12, Funny: 34 },
    commentCount: 234,
    createdAt: new Date(Date.now() - 10800000),
    comments: dummyComments,
    isOwner: true,
  },
  {
    id: '4',
    title: 'Testing the waters',
    content: 'I started a rumor about myself just to see who would believe it. It turned out to be quite revealing about my friends.',
    category: 'Drama',
    reactions: { Like: 123, Supportive: 567, Thought: 23, Anger: 45, Funny: 678 },
    commentCount: 156,
    createdAt: new Date(Date.now() - 14400000),
    comments: dummyComments,
    isOwner: false,
  },
  {
    id: '5',
    title: 'Uncontrollable laughter',
    content: 'Sometimes I laugh at completely inappropriate moments and can\'t stop. It\'s a problem, especially during serious meetings.',
    category: 'Funny',
    reactions: { Like: 345, Supportive: 67, Thought: 12, Anger: 8, Funny: 890 },
    commentCount: 78,
    createdAt: new Date(Date.now() - 18000000),
    comments: dummyComments,
    isOwner: false,
  },
];

const sortByTrending = (posts: Post[]): Post[] => {
  return [...posts].sort((a, b) => {
    const aTotal = Object.values(a.reactions).reduce((sum, v) => sum + v, 0) + a.commentCount * 2;
    const bTotal = Object.values(b.reactions).reduce((sum, v) => sum + v, 0) + b.commentCount * 2;
    return bTotal - aTotal;
  });
};

export const useFeedStore = create<FeedState>((set) => ({
  posts: [],
  trendingPosts: [],
  loading: false,
  loadingMore: false,
  hasMore: true,
  currentPage: 0,
  setPosts: (posts) => set({ posts, trendingPosts: sortByTrending(posts) }),
  setTrendingPosts: (posts) => set({ trendingPosts: posts }),
  setLoading: (loading) => set({ loading }),
  addReaction: (postId, reaction) =>
    set((state) => {
      const updatedPosts = state.posts.map((post) =>
        post.id === postId
          ? (() => {
              const current = post.myReactionType ?? null;
              const next = reaction;
              const nextReactions = { ...post.reactions };

              // If no current reaction, add the new one
              if (!current) {
                nextReactions[next] = (nextReactions[next] ?? 0) + 1;
                return { ...post, reactions: nextReactions, myReactionType: next };
              }

              // If clicking the same reaction, remove it
              if (current === next) {
                nextReactions[current] = Math.max(0, (nextReactions[current] ?? 0) - 1);
                return { ...post, reactions: nextReactions, myReactionType: null };
              }

              // If changing from one reaction to another
              nextReactions[current] = Math.max(0, (nextReactions[current] ?? 0) - 1);
              nextReactions[next] = (nextReactions[next] ?? 0) + 1;
              return { ...post, reactions: nextReactions, myReactionType: next };
            })()
          : post
      );
      
      // Also update trending posts
      const updatedTrendingPosts = state.trendingPosts.map((post) =>
        post.id === postId
          ? (() => {
              const current = post.myReactionType ?? null;
              const next = reaction;
              const nextReactions = { ...post.reactions };

              if (!current) {
                nextReactions[next] = (nextReactions[next] ?? 0) + 1;
                return { ...post, reactions: nextReactions, myReactionType: next };
              }

              if (current === next) {
                nextReactions[current] = Math.max(0, (nextReactions[current] ?? 0) - 1);
                return { ...post, reactions: nextReactions, myReactionType: null };
              }

              nextReactions[current] = Math.max(0, (nextReactions[current] ?? 0) - 1);
              nextReactions[next] = (nextReactions[next] ?? 0) + 1;
              return { ...post, reactions: nextReactions, myReactionType: next };
            })()
          : post
      );
      
      return {
        posts: updatedPosts,
        trendingPosts: updatedTrendingPosts,
      };
    }),
  syncReactionState: (postId, summary, myReactionType) =>
    set((state) => {
      // Update posts array
      const updatedPosts = state.posts.map((post) =>
        post.id === postId ? { ...post, reactions: summary ?? {}, myReactionType } : post
      );
      
      // Update trending posts array separately for efficiency
      const updatedTrendingPosts = state.trendingPosts.map((post) =>
        post.id === postId ? { ...post, reactions: summary ?? {}, myReactionType } : post
      );
      
      return {
        posts: updatedPosts,
        trendingPosts: updatedTrendingPosts,
      };
    }),
  deletePost: (postId) =>
    set((state) => {
      const updatedPosts = state.posts.filter((p) => p.id !== postId);
      return {
        posts: updatedPosts,
        trendingPosts: sortByTrending(updatedPosts),
      };
    }),
  updatePost: (postId, content) =>
    set((state) => {
      const updatedPosts = state.posts.map((p) =>
        p.id === postId ? { ...p, content } : p
      );
      return {
        posts: updatedPosts,
        trendingPosts: sortByTrending(updatedPosts),
      };
    }),
  setLoadingMore: (loadingMore) => set({ loadingMore }),
  setHasMore: (hasMore) => set({ hasMore }),
  appendPosts: (newPosts) =>
    set((state) => ({
      posts: [...state.posts, ...newPosts],
      currentPage: state.currentPage + 1,
    })),
  refreshFeed: async () => {
    // Reload real data
    try {
      const homePosts = await getHomeFeed();
      const posts = homePosts.map((post: HomePost) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.category as Category,
        societyName: post.societyName,
        reactions: post.reactions_summary || post.reactions || {},
        commentCount: post.comment_count || post.commentCount || 0,
        createdAt: new Date(post.created_at || post.createdAt || Date.now()),
        isOwner: post.isOwner || false,
        myReactionType: post.myReactionType || null,
      }));
      set({ posts, trendingPosts: sortByTrending(posts) });
    } catch (error) {
      console.error('Failed to refresh feed:', error);
    }
  },
  loadFeed: async (page: number = 0, append: boolean = false) => {
    const pageSize = 10; // Load in chunks of 10
    if (append) {
      set({ loadingMore: true });
    } else {
      set({ loading: true, currentPage: 0, posts: [] });
    }
    
    try {
      console.log('Loading home feed page:', page);
      const homePosts = await getHomeFeed(pageSize, page * pageSize);
      console.log('Home posts loaded:', homePosts);
      const posts = homePosts.map((post: HomePost) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.category as Category,
        societyName: post.societyName,
        reactions: post.reactions_summary || post.reactions || {},
        commentCount: post.comment_count || post.commentCount || 0,
        createdAt: new Date(post.created_at || post.createdAt || Date.now()),
        isOwner: post.isOwner || false,
        myReactionType: post.myReactionType || null,
      }));
      console.log('Processed posts for store:', posts.map(p => ({
        id: p.id,
        title: p.title,
        myReactionType: p.myReactionType,
        reactions: p.reactions
      })));
      
      const hasMore = homePosts.length === pageSize;
      
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
      
      // Don't retry on auth errors - they're handled by authErrorHandler
      const errorMessage = (error as any)?.message;
      const errorStatus = (error as any)?.status;
      if (errorMessage?.includes('Unauthorized') || errorStatus === 401) {
        console.log('Auth error in feed loading, stopping retries');
        return;
      }
    }
  },
  loadTrending: async () => {
    set({ loading: true });
    try {
      console.log('Loading trending feed...');
      const trendingPosts = await getTrendingFeed();
      console.log('Trending posts loaded:', trendingPosts);
      const posts = trendingPosts.map((post: HomePost) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.category as Category,
        societyName: post.societyName,
        reactions: post.reactions_summary || post.reactions || {},
        commentCount: post.comment_count || post.commentCount || 0,
        createdAt: new Date(post.created_at || post.createdAt || Date.now()),
        isOwner: post.isOwner || false,
        myReactionType: post.myReactionType || null,
      }));
      console.log('Processed trending posts for store:', posts);
      set({ trendingPosts: posts, loading: false });
    } catch (error) {
      console.error('Failed to load trending:', error);
      set({ loading: false });
      
      // Don't retry on auth errors - they're handled by authErrorHandler
      const errorMessage = (error as any)?.message;
      const errorStatus = (error as any)?.status;
      if (errorMessage?.includes('Unauthorized') || errorStatus === 401) {
        console.log('Auth error in trending loading, stopping retries');
        return;
      }
    }
  },
}));
