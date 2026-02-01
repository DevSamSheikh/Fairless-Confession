import { create } from 'zustand';
import { Category, Reaction } from '../utils/constants';

export interface Post {
  id: string;
  content: string;
  category: Category;
  reactions: Record<Reaction, number>;
  commentCount: number;
  createdAt: Date;
}

interface FeedState {
  posts: Post[];
  trendingPosts: Post[];
  loading: boolean;
  setPosts: (posts: Post[]) => void;
  setTrendingPosts: (posts: Post[]) => void;
  setLoading: (loading: boolean) => void;
  addReaction: (postId: string, reaction: Reaction) => void;
}

const dummyPosts: Post[] = [
  {
    id: '1',
    content: 'I secretly hate group projects but always end up doing all the work anyway.',
    category: 'College',
    reactions: { '❤️': 234, '😮': 45, '😢': 12, '😡': 89, '😂': 156 },
    commentCount: 67,
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    content: 'My boss thinks I work from home but I actually work from the beach most days.',
    category: 'Work',
    reactions: { '❤️': 567, '😮': 123, '😢': 8, '😡': 34, '😂': 445 },
    commentCount: 89,
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: '3',
    content: 'Still in love with someone who doesn\'t even know I exist.',
    category: 'Love',
    reactions: { '❤️': 890, '😮': 23, '😢': 456, '😡': 12, '😂': 34 },
    commentCount: 234,
    createdAt: new Date(Date.now() - 10800000),
  },
  {
    id: '4',
    content: 'I started a rumor about myself just to see who would believe it.',
    category: 'Drama',
    reactions: { '❤️': 123, '😮': 567, '😢': 23, '😡': 45, '😂': 678 },
    commentCount: 156,
    createdAt: new Date(Date.now() - 14400000),
  },
  {
    id: '5',
    content: 'Sometimes I laugh at completely inappropriate moments and can\'t stop.',
    category: 'Funny',
    reactions: { '❤️': 345, '😮': 67, '😢': 12, '😡': 8, '😂': 890 },
    commentCount: 78,
    createdAt: new Date(Date.now() - 18000000),
  },
];

const sortByTrending = (posts: Post[]): Post[] => {
  return [...posts].sort((a, b) => {
    const aTotal = Object.values(a.reactions).reduce((sum, v) => sum + v, 0);
    const bTotal = Object.values(b.reactions).reduce((sum, v) => sum + v, 0);
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
          ? { ...post, reactions: { ...post.reactions, [reaction]: post.reactions[reaction] + 1 } }
          : post
      );
      return {
        posts: updatedPosts,
        trendingPosts: sortByTrending(updatedPosts),
      };
    }),
}));
