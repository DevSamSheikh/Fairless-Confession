import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthUser } from "../api/auth";
import { setAuthTokenStore } from "../api/client";
import { getUserRateLimit, type UserRateLimit } from "../api/rateLimit";

const AUTH_TOKEN_KEY = "@confessbox_token";
const AUTH_USER_KEY = "@confessbox_user";
const RATE_LIMIT_KEY = "@confessbox_rate_limit";
const RATE_LIMIT_TIMESTAMP_KEY = "@confessbox_rate_limit_timestamp";

export interface UserState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  userId: string | null;
  isHydrated: boolean;
  postsToday: number;
  commentsThisHour: number;
  rateLimit: UserRateLimit | null;
  lastRateLimitCheck: number; // timestamp
  setUser: (user: AuthUser | null) => void;
  setAuth: (token: string | null, user: AuthUser | null) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  incrementPosts: () => void;
  incrementComments: () => void;
  fetchRateLimit: () => Promise<UserRateLimit>;
  refreshRateLimit: () => Promise<void>;
  clearRateLimitCache: () => void;
  canPost: () => boolean;
  getRemainingPosts: () => number;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  userId: null,
  isHydrated: false,
  postsToday: 0,
  commentsThisHour: 0,
  rateLimit: null,
  lastRateLimitCheck: 0,

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
    await AsyncStorage.multiRemove([
      AUTH_TOKEN_KEY,
      AUTH_USER_KEY,
      RATE_LIMIT_KEY,
      RATE_LIMIT_TIMESTAMP_KEY,
    ]);
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      userId: null,
      rateLimit: null,
      lastRateLimitCheck: 0,
    });
    // Update the API client with no token
    setAuthTokenStore({
      getState: () => ({ token: null }),
    });
  },

  hydrate: async () => {
    try {
      const [token, userJson, rateLimitJson, rateLimitTimestamp] =
        await Promise.all([
          AsyncStorage.getItem(AUTH_TOKEN_KEY),
          AsyncStorage.getItem(AUTH_USER_KEY),
          AsyncStorage.getItem(RATE_LIMIT_KEY),
          AsyncStorage.getItem(RATE_LIMIT_TIMESTAMP_KEY),
        ]);
      const user: AuthUser | null = userJson ? JSON.parse(userJson) : null;
      const rateLimit: UserRateLimit | null = rateLimitJson
        ? JSON.parse(rateLimitJson)
        : null;
      const lastCheck = rateLimitTimestamp
        ? parseInt(rateLimitTimestamp, 10)
        : 0;

      set({
        token: token || null,
        user,
        isAuthenticated: !!(token && user),
        userId: user ? user.id : null,
        isHydrated: true,
        rateLimit,
        lastRateLimitCheck: lastCheck,
      });
      setAuthTokenStore({
        getState: () => ({ token: get().token }),
      });
    } catch {
      set({
        isHydrated: true,
        rateLimit: null,
        lastRateLimitCheck: 0,
      });
      setAuthTokenStore({
        getState: () => ({ token: get().token }),
      });
    }
  },

  incrementPosts: () =>
    set((s) => ({
      postsToday: s.postsToday + 1,
      // Also update rate limit if it exists
      rateLimit: s.rateLimit
        ? {
            ...s.rateLimit,
            postsToday: s.rateLimit.postsToday + 1,
            remainingPosts: Math.max(0, s.rateLimit.remainingPosts - 1),
            canPost: s.rateLimit.postsToday + 1 < s.rateLimit.postsLimit,
          }
        : null,
    })),

  incrementComments: () =>
    set((s) => ({ commentsThisHour: s.commentsThisHour + 1 })),

  fetchRateLimit: async () => {
    try {
      const rateLimit = await getUserRateLimit();
      const now = Date.now();

      // Cache the rate limit data
      await AsyncStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(rateLimit));
      await AsyncStorage.setItem(RATE_LIMIT_TIMESTAMP_KEY, now.toString());

      set({
        rateLimit,
        lastRateLimitCheck: now,
        postsToday: rateLimit.postsToday, // Sync with backend
      });

      return rateLimit;
    } catch (error: any) {
      console.error("[fetchRateLimit] Error:", error);

      // Don't throw error for 404 (endpoint not implemented) - use frontend fallback
      if (error.message && error.message.includes("404")) {
        console.log(
          "[fetchRateLimit] Backend endpoint not available, using frontend logic",
        );
        // Set a default rate limit based on frontend state
        const postsToday = get().postsToday || 0;
        const postsLimit = 10;
        const defaultRateLimit: UserRateLimit = {
          postsToday,
          postsLimit,
          remainingPosts: Math.max(0, postsLimit - postsToday),
          nextResetTime: new Date(
            Date.now() + 24 * 60 * 60 * 1000,
          ).toISOString(),
          canPost: postsToday < postsLimit,
        };

        set({
          rateLimit: defaultRateLimit,
          lastRateLimitCheck: Date.now(),
        });

        return defaultRateLimit;
      }

      throw error;
    }
  },

  refreshRateLimit: async () => {
    // Clear cache and fetch fresh data
    get().clearRateLimitCache();
    await get().fetchRateLimit();
  },

  clearRateLimitCache: () => {
    AsyncStorage.multiRemove([RATE_LIMIT_KEY, RATE_LIMIT_TIMESTAMP_KEY]);
    set({
      rateLimit: null,
      lastRateLimitCheck: 0,
    });
  },

  canPost: () => {
    const { rateLimit, postsToday } = get();
    if (rateLimit) {
      return rateLimit.canPost;
    }
    // Fallback to frontend logic if no backend data
    return postsToday < 10;
  },

  getRemainingPosts: () => {
    const { rateLimit, postsToday } = get();
    if (rateLimit) {
      return rateLimit.remainingPosts;
    }
    // Fallback to frontend logic if no backend data
    return Math.max(0, 10 - postsToday);
  },
}));

// Api client reads token from this store (updated on hydrate + setAuth)
setAuthTokenStore({
  getState: () => ({ token: useUserStore.getState().token }),
});
