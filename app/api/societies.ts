import { apiFetch } from './client';

export interface Society {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  is_private: boolean;
  member_count: number;
  created_at: string;
  updated_at: string;
  icon_name?: string;
  isJoined?: boolean;
  isOwner?: boolean;
}

export interface SocietyMember {
  user_id: string;
  society_id: string;
  role: 'Member' | 'Admin';
  joined_at: string;
}

export interface SocietyPost {
  id: string;
  content: string;
  society_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  reaction_counts: Record<string, number>;
  user: {
    identity_id: string;
    avatar_seed: string;
    user_id_custom: string;
  };
  society: {
    id: string;
    name: string;
  };
}

// Helper function for GET requests
const apiGet = async (path: string, params?: Record<string, any>) => {
  const url = params ? `${path}?${new URLSearchParams(params).toString()}` : path;
  const response = await apiFetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

// Helper function for POST requests
const apiPost = async (path: string, body?: any) => {
  const response = await apiFetch(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

// Get all public societies
export const getSocieties = async (): Promise<Society[]> => {
  return apiGet('/api/societies');
};

// Get society by ID
export const getSocietyById = async (id: string): Promise<Society> => {
  return apiGet(`/api/societies/${id}`);
};

// Get societies the user has joined
export const getJoinedSocieties = async (): Promise<Society[]> => {
  return apiGet('/api/societies/joined');
};

// Get societies created by the user
export const getUserSocieties = async (): Promise<Society[]> => {
  return apiGet('/api/societies/you');
};

// Discover societies (with optional search)
export const discoverSocieties = async (query?: string): Promise<Society[]> => {
  return apiGet('/api/societies/discover', query ? { q: query } : undefined);
};

// Get posts from joined societies
export const getSocietyConfessions = async (): Promise<SocietyPost[]> => {
  try {
    return await apiGet('/api/societies/confessions');
  } catch (error) {
    console.error('Failed to fetch society confessions:', error);
    // Return empty array as fallback instead of throwing
    return [];
  }
};

// Join a society
export const joinSociety = async (societyId: string): Promise<{ success: boolean }> => {
  return apiPost(`/api/societies/join/${societyId}`);
};

// Leave a society
export const leaveSociety = async (societyId: string): Promise<{ success: boolean }> => {
  return apiPost('/api/societies/leave', { societyId });
};

// Create a new society
export const createSociety = async (data: {
  name: string;
  description?: string;
  isPrivate?: boolean;
  iconName?: string;
}): Promise<Society> => {
  // Map frontend field names to backend field names
  const backendData = {
    name: data.name,
    description: data.description,
    isPrivate: data.isPrivate,
    iconName: data.iconName, // Backend expects iconName
  };
  return apiPost('/api/create-society', backendData);
};
