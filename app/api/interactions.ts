import { getApiUrl } from "./config";
import { useUserStore } from "../store/user.store";

interface ReactToPostBody {
  postId: string;
  reactionType: string;
}

type VoteDirection = "up" | "down";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isServerPostId(postId: string): boolean {
  return UUID_REGEX.test(postId);
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  score: number;
  myVote: number;
  user?: {
    identity_id?: string;
    avatar_seed?: string;
    user_id_custom?: string;
  } | null;
}

export interface ReactToPostResult {
  success: boolean;
  currentReactionType: string | null;
  summary: Record<string, number>;
}

function getAuthTokenOrThrow() {
  const token = useUserStore.getState().token;
  if (!token) {
    throw new Error("You must be signed in to continue.");
  }
  return token;
}

async function requestInteractions(
  path: string,
  init: RequestInit,
): Promise<Record<string, unknown>> {
  const baseUrl = await getApiUrl();
  const token = getAuthTokenOrThrow();

  const res = await fetch(`${baseUrl}/api/interactions${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });

  const rawText = await res.text().catch(() => "");
  const data = (() => {
    if (!rawText) return {} as Record<string, unknown>;
    try {
      return JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      return { raw: rawText };
    }
  })();

  if (!res.ok) {
    const serverMessage =
      (typeof data?.error === "string" && data.error) ||
      (typeof data?.message === "string" && data.message) ||
      "Request failed.";
    throw new Error(`[${res.status}] ${serverMessage}`);
  }

  return data;
}

function normalizeComment(input: Record<string, unknown>): PostComment | null {
  const id = typeof input.id === "string" ? input.id : null;
  const postId = typeof input.postId === "string" ? input.postId : null;
  const userId = typeof input.userId === "string" ? input.userId : null;
  const content = typeof input.content === "string" ? input.content : null;
  const createdAt =
    typeof input.createdAt === "string" ? input.createdAt : null;
  const updatedAt =
    typeof input.updatedAt === "string" ? input.updatedAt : createdAt;

  if (!id || !postId || !userId || !content || !createdAt || !updatedAt) {
    return null;
  }

  return {
    id,
    postId,
    userId,
    content,
    createdAt,
    updatedAt,
    upvotes: typeof input.upvotes === "number" ? input.upvotes : 0,
    downvotes: typeof input.downvotes === "number" ? input.downvotes : 0,
    score: typeof input.score === "number" ? input.score : 0,
    myVote: typeof input.myVote === "number" ? input.myVote : 0,
    user:
      input.user && typeof input.user === "object"
        ? (input.user as PostComment["user"])
        : null,
  };
}

function normalizeComments(payload: unknown): PostComment[] {
  if (!Array.isArray(payload)) return [];
  return payload
    .map((item) =>
      item && typeof item === "object"
        ? normalizeComment(item as Record<string, unknown>)
        : null,
    )
    .filter((item): item is PostComment => !!item);
}

export async function reactToPost({
  postId,
  reactionType,
}: ReactToPostBody): Promise<ReactToPostResult> {
  const data = await requestInteractions("/react", {
    method: "POST",
    body: JSON.stringify({ postId, reactionType }),
  });

  const summaryRaw = data?.summary;
  const summary: Record<string, number> = {};
  if (summaryRaw && typeof summaryRaw === "object") {
    for (const [key, value] of Object.entries(
      summaryRaw as Record<string, unknown>,
    )) {
      if (typeof value === "number" && Number.isFinite(value)) {
        summary[key] = value;
      }
    }
  }

  const currentReactionType =
    typeof data?.currentReactionType === "string" ||
    data?.currentReactionType === null
      ? data.currentReactionType
      : null;

  return {
    success: data?.success !== false,
    currentReactionType,
    summary,
  };
}

export async function fetchCommentsForPost(
  postId: string,
): Promise<PostComment[]> {
  const data = await requestInteractions(`/comments/${postId}`, {
    method: "GET",
  });
  return normalizeComments(data?.comments);
}

export async function addCommentToPost(
  postId: string,
  content: string,
): Promise<PostComment[]> {
  const data = await requestInteractions("/comment", {
    method: "POST",
    body: JSON.stringify({ postId, content }),
  });
  return normalizeComments(data?.comments);
}

export async function editComment(
  commentId: string,
  content: string,
): Promise<PostComment[]> {
  const data = await requestInteractions(`/comment/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });
  return normalizeComments(data?.comments);
}

export async function deleteComment(commentId: string): Promise<PostComment[]> {
  const data = await requestInteractions(`/comment/${commentId}`, {
    method: "DELETE",
  });
  return normalizeComments(data?.comments);
}

export async function voteOnComment(
  commentId: string,
  direction: VoteDirection,
): Promise<PostComment[]> {
  const data = await requestInteractions(`/comment/${commentId}/vote`, {
    method: "POST",
    body: JSON.stringify({ direction }),
  });
  return normalizeComments(data?.comments);
}

export interface UserActivity {
  id: string;
  type: "reaction" | "comment" | "society_join" | "new_member";
  message: string;
  time: string;
  postId: string | null;
  icon: string;
  iconColor: string;
  user?: {
    identity_id?: string;
    avatar_seed?: string;
    user_id_custom?: string;
  };
  createdAt: string;
  isRead: boolean;
  societyId?: string;
  societyName?: string;
}

export interface UserActivitiesResponse {
  activities: UserActivity[];
  total: number;
}

export async function deleteActivity(activityId: string): Promise<void> {
  try {
    const response = await requestInteractions(`/activities/${activityId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete activity: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
}

export async function fetchUserActivities(): Promise<UserActivitiesResponse> {
  const data = await requestInteractions("/my-activities", { method: "GET" });

  const activities = Array.isArray(data?.activities)
    ? data.activities.map((activity: any) => ({
        id: typeof activity.id === "string" ? activity.id : "",
        type:
          activity.type === "reaction" ||
          activity.type === "comment" ||
          activity.type === "society_join" ||
          activity.type === "new_member"
            ? activity.type
            : "reaction",
        message: typeof activity.message === "string" ? activity.message : "",
        time: typeof activity.time === "string" ? activity.time : "",
        postId: activity.postId || null,
        icon: typeof activity.icon === "string" ? activity.icon : "heart",
        iconColor:
          typeof activity.iconColor === "string"
            ? activity.iconColor
            : "#6B5CE7",
        user:
          activity.user && typeof activity.user === "object"
            ? activity.user
            : undefined,
        createdAt:
          typeof activity.createdAt === "string" ? activity.createdAt : "",
        isRead: typeof activity.isRead === "boolean" ? activity.isRead : false,
        societyId: activity.societyId || undefined,
        societyName: activity.societyName || undefined,
      }))
    : [];

  return {
    activities,
    total: typeof data?.total === "number" ? data.total : activities.length,
  };
}
