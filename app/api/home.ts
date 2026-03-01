import { apiFetch } from './client';

export interface HomePost {
  id: string;
  title?: string;
  content: string;
  category: string;
  societyName?: string;
  reactions_summary?: Record<string, number>;
  reactions?: Record<string, number>;
  comment_count?: number;
  commentCount?: number;
  created_at?: string;
  createdAt?: string;
  isOwner?: boolean;
  myReactionType?: string | null;
  user?: {
    identity_id: string;
    avatar_seed: string;
    user_id_custom: string;
  };
}

export async function getHomeFeed(limit: number = 20, offset: number = 0): Promise<HomePost[]> {
  try {
    const res = await apiFetch(`/api/home?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
    
    console.log('Home feed response status:', res.status);
    
    const data = await res.json().catch(() => ({}));
    console.log('Home feed data:', data);
    
    if (!res.ok) {
      console.error('Home feed error response:', data);
      throw new Error(data?.error || `Failed to fetch home feed (${res.status})`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Home feed fetch error:', error);
    throw error;
  }
}

export async function getTrendingFeed(limit: number = 20, period: string = 'week'): Promise<HomePost[]> {
  try {
    const res = await apiFetch(`/api/home/trending?limit=${limit}&period=${period}`, {
      method: 'GET',
    });
    
    console.log('Trending feed response status:', res.status);
    
    const data = await res.json().catch(() => ({}));
    console.log('Trending feed data:', data);
    
    if (!res.ok) {
      console.error('Trending feed error response:', data);
      throw new Error(data?.error || `Failed to fetch trending feed (${res.status})`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Trending feed fetch error:', error);
    throw error;
  }
}
