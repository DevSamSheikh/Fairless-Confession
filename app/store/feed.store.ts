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
  reactions: Record<string, number>;
  commentCount: number;
  createdAt: Date;
  comments?: Comment[];
}

import { create } from 'zustand';
import { Category } from '../utils/constants';

// We'll use emojis as keys for reactions as per requirements
export type PostReaction = '❤️' | '😮' | '😢' | '😡' | '😂';

interface FeedState {
  posts: Post[];
  trendingPosts: Post[];
  loading: boolean;
  setPosts: (posts: Post[]) => void;
  setTrendingPosts: (posts: Post[]) => void;
  setLoading: (loading: boolean) => void;
  addReaction: (postId: string, reaction: string) => void;
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
    reactions: { '❤️': 234, '😮': 45, '😢': 12, '😡': 89, '😂': 156 },
    commentCount: 67,
    createdAt: new Date(Date.now() - 3600000),
    comments: dummyComments,
  },
  {
    id: '2',
    title: 'Beach work life',
    content: 'My boss thinks I work from home but I actually work from the beach most days. The view is amazing and I\'m more productive here.',
    category: 'Work',
    reactions: { '❤️': 567, '😮': 123, '😢': 8, '😡': 34, '😂': 445 },
    commentCount: 89,
    createdAt: new Date(Date.now() - 7200000),
    comments: dummyComments,
  },
  {
    id: '3',
    title: 'Secret crush',
    content: 'Still in love with someone who doesn\'t even know I exist. I see them every day and my heart just melts.',
    category: 'Love',
    reactions: { '❤️': 890, '😮': 23, '😢': 456, '😡': 12, '😂': 34 },
    commentCount: 234,
    createdAt: new Date(Date.now() - 10800000),
    comments: dummyComments,
  },
  {
    id: '4',
    title: 'Testing the waters',
    content: 'I started a rumor about myself just to see who would believe it. It turned out to be quite revealing about my friends.',
    category: 'Drama',
    reactions: { '❤️': 123, '😮': 567, '😢': 23, '😡': 45, '😂': 678 },
    commentCount: 156,
    createdAt: new Date(Date.now() - 14400000),
    comments: dummyComments,
  },
  {
    id: '5',
    title: 'Uncontrollable laughter',
    content: 'Sometimes I laugh at completely inappropriate moments and can\'t stop. It\'s a problem, especially during serious meetings.',
    category: 'Funny',
    reactions: { '❤️': 345, '😮': 67, '😢': 12, '😡': 8, '😂': 890 },
    commentCount: 78,
    createdAt: new Date(Date.now() - 18000000),
    comments: dummyComments,
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
          ? { ...post, reactions: { ...post.reactions, [reaction]: (post.reactions[reaction] || 0) + 1 } }
          : post
      );
      return {
        posts: updatedPosts,
        trendingPosts: sortByTrending(updatedPosts),
      };
    }),
}));
