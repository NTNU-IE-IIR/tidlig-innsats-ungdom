import { RouterOutputs } from '@/utils/api';
import { NextRouter } from 'next/router';
import { create } from 'zustand';

export type Content = RouterOutputs['content']['listContent'][number];

export interface BrowseStore {
  drill: Content[];
  appendContent: (theme: Content, router: NextRouter) => void;
  navigateBackTo: (theme: Content, i: number, router: NextRouter) => void;
  navigateHome: () => void;
}

export const useBrowseStore = create<BrowseStore>()((set, get) => ({
  drill: [],
  parentId: get()?.drill[get().drill.length - 1]?.id,
  appendContent: (theme, router) =>
    set((state) => {
      if (theme.discriminator === 'MEDIA') {
        router.push(`/media/${theme.id}`);
      }

      const previous = state.drill[state.drill.length - 1];

      if (
        previous?.id === theme.id &&
        previous?.discriminator === theme.discriminator
      ) {
        return state;
      }

      return { drill: [...state.drill, theme] };
    }),
  navigateBackTo: (theme, i, router) =>
    set((state) => {
      if (router.pathname.includes('media')) router.push('/');

      return {
        drill: state.drill.slice(0, i).concat(theme),
      };
    }),
  navigateHome: () => set({ drill: [] }),
}));
