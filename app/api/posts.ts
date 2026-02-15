import { getApiUrl } from './config';
import { useUserStore } from '../store/user.store';

export interface CreatePostBody {
  title?: string;
  content: string;
  category: string;
  visibility?: string;
  societyId?: string | null;
}

export class ContentBlockedError extends Error {
  constructor(
    message: string,
    public sanitizedTitle: string,
    public sanitizedContent: string,
  ) {
    super(message);
    this.name = 'ContentBlockedError';
  }
}

export async function createPost(body: CreatePostBody): Promise<{ id: string }> {
  const baseUrl = await getApiUrl();
  const token = useUserStore.getState().token;
  if (!token) throw new Error('You must be signed in to post.');

  const res = await fetch(`${baseUrl}/api/post`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: body.title?.trim() || '',
      content: body.content.trim(),
      category: body.category,
      visibility: body.visibility ?? 'public',
      societyId: body.societyId ?? null,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 400 && data?.sanitizedTitle !== undefined && data?.sanitizedContent !== undefined) {
      throw new ContentBlockedError(data.error || 'Content not allowed', data.sanitizedTitle, data.sanitizedContent);
    }
    throw new Error(data?.error || 'Failed to create post');
  }
  if (!data?.id) throw new Error('Invalid response');
  return { id: data.id };
}
