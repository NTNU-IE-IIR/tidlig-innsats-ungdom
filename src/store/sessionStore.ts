import { z } from 'zod';
import { create } from 'zustand';

const sessionStoreSchema = z.object({
  showSideMenu: z.boolean().default(false),
  viewedSessionId: z.number().nullable(),
});

export interface SessionStore extends z.infer<typeof sessionStoreSchema> {
  setViewedSessionId: (sessionId: number) => void;
  clearViewedSessionId: () => void;
  toggleSideMenu: () => void;
  closeSideMenu: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  showSideMenu: false,
  viewedSessionId: null,
  setViewedSessionId: (sessionId) => set({ viewedSessionId: sessionId }),
  clearViewedSessionId: () => set({ viewedSessionId: null }),
  toggleSideMenu: () => set((state) => ({ showSideMenu: !state.showSideMenu })),
  closeSideMenu: () => set({ showSideMenu: false }),
}));
