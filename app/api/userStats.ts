import { apiFetch } from './client';

export interface UserStats {
  confessionsCount: number;
  reactionsCount: number;
  societiesCount: number;
}

export async function getUserStats(): Promise<UserStats> {
  const res = await apiFetch('/api/user/stats', {
    method: 'GET',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to fetch user stats');
  }
  return {
    confessionsCount: data.confessionsCount || 0,
    reactionsCount: data.reactionsCount || 0,
    societiesCount: data.societiesCount || 0,
  };
}
