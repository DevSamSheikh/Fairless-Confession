import { getApiUrl } from './config';
import { useUserStore } from '../store/user.store';
import type { Post } from '../store/feed.store';

export async function fetchMyReactions(): Promise<Post[]> {
  const baseUrl = await getApiUrl();
  const token = useUserStore.getState().token;
  if (!token) {
    throw new Error('You must be signed in to view your reactions.');
  }

  const res = await fetch(`${baseUrl}/api/my-reactions`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to fetch reactions.');
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    category: item.category ?? 'Secrets',
    societyName: item.societyName,
    reactions: item.reactions ?? {},
    myReactionType: item.myReactionType,
    commentCount: item.commentCount ?? 0,
    createdAt: new Date(item.createdAt),
    isOwner: false,
  }));
}
