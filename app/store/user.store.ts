import { create } from 'zustand';

interface UserState {
  user: any | null;
  isAuthenticated: boolean;
  userId: string | null;
  postsToday: number;
  commentsThisHour: number;
  setUser: (user: any) => void;
  login: () => void;
  logout: () => void;
  incrementPosts: () => void;
  incrementComments: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  userId: null,
  postsToday: 0,
  commentsThisHour: 0,
  setUser: (user) => set({ user, isAuthenticated: !!user, userId: user ? user.id : null }),
  login: async (credentials?: any): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Logging in with', credentials);
      set({ isAuthenticated: true, userId: 'anonymous-user-' + Date.now() });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  },
  logout: () => set({ user: null, isAuthenticated: false, userId: null }),
  incrementPosts: () => set((state) => ({ postsToday: state.postsToday + 1 })),
  incrementComments: () => set((state) => ({ commentsThisHour: state.commentsThisHour + 1 })),
}));
