import { create } from 'zustand';
import type { Post } from './feed.store';

interface SavedSecretsState {
  saved: Post[];
  save: (post: Post) => void;
  remove: (postId: string) => void;
  isSaved: (postId: string) => boolean;
}

export const useSavedSecretsStore = create<SavedSecretsState>((set, get) => ({
  saved: [],
  save: (post) =>
    set((state) => {
      if (state.saved.find((p) => p.id === post.id)) {
        return state;
      }
      return { saved: [post, ...state.saved] };
    }),
  remove: (postId) =>
    set((state) => ({
      saved: state.saved.filter((p) => p.id !== postId),
    })),
  isSaved: (postId) => !!get().saved.find((p) => p.id === postId),
}));

