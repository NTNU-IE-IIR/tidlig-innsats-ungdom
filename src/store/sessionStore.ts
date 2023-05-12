import { z } from 'zod';
import { create } from 'zustand';

const sessionStoreSchema = z.object({
  viewedSessionId: z.number().nullable(),
});

export interface SessionStore extends z.infer<typeof sessionStoreSchema> {
  setViewedSessionId: (sessionId: number) => void;
  clearViewedSessionId: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  viewedSessionId: null,
  setViewedSessionId: (sessionId) => set({ viewedSessionId: sessionId }),
  clearViewedSessionId: () => set({ viewedSessionId: null }),
}));
