import { getApiUrl } from "./config";
import { useUserStore } from "../store/user.store";
import { Hashtag } from "../../shared/schema";

export interface SearchHashtagsParams {
  query: string;
  limit?: number;
}

export interface CreateHashtagBody {
  name: string;
  created_by?: string;
}

export async function searchHashtags(
  params: SearchHashtagsParams,
): Promise<Hashtag[]> {
  const baseUrl = await getApiUrl();
  const state = useUserStore.getState();
  const token = state.token;

  if (!token) {
    throw new Error("You must be signed in to search hashtags. Please log in and try again.");
  }

  if (!state.isAuthenticated) {
    throw new Error("Your session has expired. Please log in again.");
  }

  try {
    const url = new URL(`${baseUrl}/api/hashtags/search`);
    url.searchParams.append('q', params.query);
    if (params.limit) {
      url.searchParams.append('limit', params.limit.toString());
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data.hashtags || [];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to search hashtags. Please try again.");
  }
}

export async function createHashtag(
  body: CreateHashtagBody,
): Promise<Hashtag> {
  const baseUrl = await getApiUrl();
  const state = useUserStore.getState();
  const token = state.token;

  if (!token) {
    throw new Error("You must be signed in to create hashtags. Please log in and try again.");
  }

  if (!state.isAuthenticated) {
    throw new Error("Your session has expired. Please log in again.");
  }

  try {
    const res = await fetch(`${baseUrl}/api/hashtags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: body.name.trim(),
        created_by: body.created_by,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data.hashtag;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create hashtag. Please try again.");
  }
}

export async function getPopularHashtags(
  limit: number = 10,
): Promise<Hashtag[]> {
  const baseUrl = await getApiUrl();
  const state = useUserStore.getState();
  const token = state.token;

  if (!token) {
    throw new Error("You must be signed in to get popular hashtags. Please log in and try again.");
  }

  if (!state.isAuthenticated) {
    throw new Error("Your session has expired. Please log in again.");
  }

  try {
    const url = new URL(`${baseUrl}/api/hashtags/popular`);
    url.searchParams.append('limit', limit.toString());

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data.hashtags || [];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to get popular hashtags. Please try again.");
  }
}

export async function getPostHashtags(
  postId: string,
): Promise<Hashtag[]> {
  const baseUrl = await getApiUrl();
  const state = useUserStore.getState();
  const token = state.token;

  if (!token) {
    throw new Error("You must be signed in to get post hashtags. Please log in and try again.");
  }

  if (!state.isAuthenticated) {
    throw new Error("Your session has expired. Please log in again.");
  }

  try {
    const res = await fetch(`${baseUrl}/api/posts/${postId}/hashtags`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data.hashtags || [];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to get post hashtags. Please try again.");
  }
}
