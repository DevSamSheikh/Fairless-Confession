import { create } from 'zustand';
import { getSocieties, getJoinedSocieties, getUserSocieties, discoverSocieties, joinSociety as joinSocietyApi, leaveSociety as leaveSocietyApi } from '../api/societies';

export interface Society {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  is_private: boolean;
  member_count: number;
  created_at: string;
  updated_at: string;
  icon?: string;
  isJoined?: boolean;
  isOwner?: boolean;
}

interface SocietyState {
  allSocieties: Society[];
  joinedSocieties: Society[];
  userSocieties: Society[];
  discoverSocieties: Society[];
  loading: boolean;
  loadingJoined: boolean;
  loadingUser: boolean;
  loadingDiscover: boolean;
  error: string | null;
  setAllSocieties: (societies: Society[]) => void;
  setJoinedSocieties: (societies: Society[]) => void;
  setUserSocieties: (societies: Society[]) => void;
  setDiscoverSocieties: (societies: Society[]) => void;
  setLoading: (loading: boolean) => void;
  setLoadingJoined: (loading: boolean) => void;
  setLoadingUser: (loading: boolean) => void;
  setLoadingDiscover: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadAllSocieties: () => Promise<void>;
  loadJoinedSocieties: () => Promise<void>;
  loadUserSocieties: () => Promise<void>;
  loadDiscoverSocieties: (query?: string) => Promise<void>;
  joinSociety: (societyId: string) => Promise<void>;
  leaveSociety: (societyId: string) => Promise<void>;
  refreshAll: () => Promise<void>;
}

export const useSocietyStore = create<SocietyState>((set, get) => ({
  societies: [],
  loading: false,
  loadingMore: false,
  hasMore: true,
  currentPage: 0,

  setSocieties: (societies) => set({ societies }),
  setLoading: (loading) => set({ loading }),
  setLoadingMore: (loadingMore) => set({ loadingMore }),
  setHasMore: (hasMore) => set({ hasMore }),

  appendSocieties: (newSocieties) =>
    set((state) => ({
      societies: [...state.societies, ...newSocieties],
      currentPage: state.currentPage + 1,
    })),

  loadSocieties: async (page: number = 0, append: boolean = false) => {
    const pageSize = 8; // Load societies in chunks of 8
    if (append) {
      set({ loadingMore: true });
    } else {
      set({ loading: true, currentPage: 0, societies: [] });
    }
    
    try {
      console.log('Loading societies page:', page);
      const res = await apiFetch(`/api/societies?limit=${pageSize}&offset=${page * pageSize}`, {
        method: 'GET',
      });
      
      const data = await res.json().catch(() => ({}));
      console.log('Societies loaded:', data);
      
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to fetch societies');
      }
      
      const societies: Society[] = (data || []).map((society: any) => ({
        id: society.id,
        name: society.name,
        description: society.description || '',
        icon: society.icon || 'people',
        memberCount: society.member_count || society.memberCount || 0,
        isJoined: society.is_joined || false,
        isOwner: society.is_owner || false,
        createdAt: society.created_at || society.createdAt || new Date().toISOString(),
        hookText: society.hook_text || society.hookText,
        rules: society.rules || [],
      }));
      
      console.log('Processed societies for store:', societies);
      
      const hasMore = societies.length === pageSize;
      
      if (append) {
        set((state) => ({
          societies: [...state.societies, ...societies],
          loadingMore: false,
          hasMore,
          currentPage: page,
        }));
      } else {
        set({ societies, loading: false, hasMore, currentPage: 0 });
      }
    } catch (error) {
      console.error('Failed to load societies:', error);
      set({ loading: false, loadingMore: false });
    }
  },

  joinSociety: async (societyId: string) => {
    try {
      const res = await apiFetch(`/api/societies/${societyId}/join`, {
        method: 'POST',
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to join society');
      }
      
      // Update local state
      set((state) => ({
        societies: state.societies.map(society =>
          society.id === societyId ? { ...society, isJoined: true, memberCount: society.memberCount + 1 } : society
        ),
      }));
    } catch (error) {
      console.error('Failed to join society:', error);
      throw error;
    }
  },

  leaveSociety: async (societyId: string) => {
    try {
      const res = await apiFetch(`/api/societies/${societyId}/leave`, {
        method: 'POST',
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to leave society');
      }
      
      // Update local state
      set((state) => ({
        societies: state.societies.map(society =>
          society.id === societyId ? { ...society, isJoined: false, memberCount: Math.max(0, society.memberCount - 1) } : society
        ),
      }));
    } catch (error) {
      console.error('Failed to leave society:', error);
      throw error;
    }
  },
}));
