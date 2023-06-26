import { z } from 'zod';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const sessionStoreSchema = z.object({
  showSideMenu: z.boolean().default(false),
  viewedSessionId: z.string().nullable(),
  /**
   * The key is the media id, the value is the duration of seconds spent viewing that media.
   */
  viewedSessionMedias: z.record(z.number(), z.number()),
});

export interface SessionStore extends z.infer<typeof sessionStoreSchema> {
  setViewedSessionId: (sessionId: string) => void;
  clearViewedSession: () => void;
  toggleSideMenu: () => void;
  closeSideMenu: () => void;
  incrementMediaViewDuration: (mediaId: number) => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      showSideMenu: false,
      viewedSessionId: null,
      viewedSessionMedias: {},
      setViewedSessionId: (sessionId) => set({ viewedSessionId: sessionId }),
      clearViewedSession: () =>
        set({ viewedSessionId: null, viewedSessionMedias: {} }),
      toggleSideMenu: () =>
        set((state) => ({ showSideMenu: !state.showSideMenu })),
      closeSideMenu: () => set({ showSideMenu: false }),
      incrementMediaViewDuration: (mediaId) =>
        set((state) => {
          if (state.viewedSessionId === null) return {};

          return {
            viewedSessionMedias: {
              ...state.viewedSessionMedias,
              [mediaId]: (state.viewedSessionMedias[mediaId] ?? 0) + 1,
            },
          };
        }),
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
