import { getApiUrl } from './config';
import { useUserStore } from '../store/user.store';
import type { Post } from '../store/feed.store';
import type { Category } from '../utils/constants';

interface MyConfessionRow {
  id: string;
  title: string | null;
  content: string;
  category: Category;
  created_at: string;
  reactions_summary?: Record<string, number> | null;
  myReactionType?: string | null;
  my_reaction_type?: string | null;
  comment_count?: number | null;
  society?: { id: string; name: string } | null;
}

export async function fetchMyConfessions(): Promise<Post[]> {
  const baseUrl = await getApiUrl();
  const token = useUserStore.getState().token;
  if (!token) {
    throw new Error('You must be signed in to view your confessions.');
  }

  const res = await fetch(`${baseUrl}/api/my-confessions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => []);
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to load your confessions.');
  }

  return (data as MyConfessionRow[]).map((row) => ({
    id: row.id,
    title: row.title || undefined,
    content: row.content || '',
    category: (row.category as Category) ?? 'Secrets',
    societyName: row.society?.name ?? undefined,
    reactions: (row.reactions_summary as Record<string, number> | null) ?? {},
    myReactionType: row.myReactionType ?? row.my_reaction_type ?? null,
    commentCount: row.comment_count ?? 0,
    createdAt: new Date(row.created_at),
    isOwner: true,
  }));
}

export async function deleteMyConfession(postId: string): Promise<void> {
  const baseUrl = await getApiUrl();
  const token = useUserStore.getState().token;
  if (!token) {
    throw new Error('You must be signed in to delete a confession.');
  }

  const res = await fetch(`${baseUrl}/api/my-confession/delete/${postId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to delete confession.');
  }
}

export async function editMyConfession(postId: string, content: string): Promise<void> {
  const baseUrl = await getApiUrl();
  const token = useUserStore.getState().token;
  if (!token) {
    throw new Error('You must be signed in to edit a confession.');
  }

  const res = await fetch(`${baseUrl}/api/my-confession/edit/${postId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content: content.trim() }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to edit confession.');
  }
}

