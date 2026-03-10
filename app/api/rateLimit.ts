import { getApiUrl } from "./config";
import { useUserStore } from "../store/user.store";

export interface UserRateLimit {
  postsToday: number;
  postsLimit: number;
  remainingPosts: number;
  nextResetTime: string; // ISO timestamp
  canPost: boolean;
}

export async function getUserRateLimit(): Promise<UserRateLimit> {
  const state = useUserStore.getState();
  const token = state.token;

  if (!token) {
    throw new Error(
      "You must be signed in to check rate limits. Please log in and try again.",
    );
  }

  if (!state.isAuthenticated) {
    throw new Error("Your session has expired. Please log in again.");
  }

  // Use frontend rate limit directly to avoid backend 404 errors
  const postsToday = state.postsToday || 0;
  const postsLimit = 10;
  const remainingPosts = Math.max(0, postsLimit - postsToday);

  return {
    postsToday,
    postsLimit,
    remainingPosts,
    nextResetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    canPost: postsToday < postsLimit,
  };
}

export async function validatePostLimit(): Promise<boolean> {
  try {
    const rateLimit = await getUserRateLimit();
    return rateLimit.canPost;
  } catch (error) {
    console.error("[validatePostLimit] Error:", error);
    // If we can't validate, allow posting but let the backend handle it
    return true;
  }
}
