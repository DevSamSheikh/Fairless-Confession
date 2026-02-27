import { create } from 'zustand';
import { Category } from '../utils/constants';

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
  setPosts: (posts: Post[]) => void;
  setTrendingPosts: (posts: Post[]) => void;
  setLoading: (loading: boolean) => void;
  addReaction: (postId: string, reaction: string) => void;
  syncReactionState: (postId: string, summary: Record<string, number>, myReactionType: string | null) => void;
  deletePost: (postId: string) => void;
  updatePost: (postId: string, content: string) => void;
  refreshFeed: () => void;
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
  posts: dummyPosts,
  trendingPosts: sortByTrending(dummyPosts),
  loading: false,
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
        trendingPosts: sortByTrending(updatedPosts),
      };
    }),
  syncReactionState: (postId, summary, myReactionType) =>
    set((state) => {
      const updatedPosts = state.posts.map((post) =>
        post.id === postId ? { ...post, reactions: summary ?? {}, myReactionType } : post
      );
      return {
        posts: updatedPosts,
        trendingPosts: sortByTrending(updatedPosts),
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
  refreshFeed: () =>
    set((state) => ({
      // Shuffle posts to simulate "refresh"
      posts: [...state.posts].sort(() => Math.random() - 0.5),
      trendingPosts: sortByTrending(state.posts)
    })),
}));
