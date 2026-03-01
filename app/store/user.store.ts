import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from '../api/auth';
import { setAuthTokenStore } from '../api/client';

const AUTH_TOKEN_KEY = '@confessbox_token';
const AUTH_USER_KEY = '@confessbox_user';

export interface UserState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  userId: string | null;
  isHydrated: boolean;
  postsToday: number;
  commentsThisHour: number;
  setUser: (user: AuthUser | null) => void;
  setAuth: (token: string | null, user: AuthUser | null) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  incrementPosts: () => void;
  incrementComments: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  userId: null,
  isHydrated: false,
  postsToday: 0,
  commentsThisHour: 0,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      userId: user ? user.id : null,
    }),

  setAuth: async (token, user) => {
    if (token) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    }
    if (user) {
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(AUTH_USER_KEY);
    }
    set({
      token,
      user,
      isAuthenticated: !!user,
      userId: user ? user.id : null,
    });
    // Update the API client with the new token
    setAuthTokenStore({
      getState: () => ({ token }),
    });
  },

  logout: async () => {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      userId: null,
    });
    // Update the API client with no token
    setAuthTokenStore({
      getState: () => ({ token: null }),
    });
  },

  hydrate: async () => {
    try {
      const [token, userJson] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(AUTH_USER_KEY),
      ]);
      const user: AuthUser | null = userJson ? JSON.parse(userJson) : null;
      set({
        token: token || null,
        user,
        isAuthenticated: !!(token && user),
        userId: user ? user.id : null,
        isHydrated: true,
      });
      setAuthTokenStore({
        getState: () => ({ token: get().token }),
      });
    } catch {
      set({ isHydrated: true });
      setAuthTokenStore({
        getState: () => ({ token: get().token }),
      });
    }
  },

  incrementPosts: () => set((s) => ({ postsToday: s.postsToday + 1 })),
  incrementComments: () => set((s) => ({ commentsThisHour: s.commentsThisHour + 1 })),
}));

// Api client reads token from this store (updated on hydrate + setAuth)
setAuthTokenStore({
  getState: () => ({ token: useUserStore.getState().token }),
});
