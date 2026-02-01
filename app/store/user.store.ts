import { create } from 'zustand';

interface UserState {
  isAuthenticated: boolean;
  userId: string | null;
  postsToday: number;
  commentsThisHour: number;
  login: () => void;
  logout: () => void;
  incrementPosts: () => void;
  incrementComments: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  isAuthenticated: false,
  userId: null,
  postsToday: 0,
  commentsThisHour: 0,
  login: () => set({ isAuthenticated: true, userId: 'anonymous-user-' + Date.now() }),
  logout: () => set({ isAuthenticated: false, userId: null }),
  incrementPosts: () => set((state) => ({ postsToday: state.postsToday + 1 })),
  incrementComments: () => set((state) => ({ commentsThisHour: state.commentsThisHour + 1 })),
}));
