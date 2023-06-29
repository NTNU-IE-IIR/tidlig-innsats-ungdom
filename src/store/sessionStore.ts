import { z } from 'zod';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const sessionStoreSchema = z.object({
  showSideMenu: z.boolean().default(false),
  viewedConsultationId: z.string().optional(),
  activeSession: z
    .object({
      name: z.string(),
      startedAt: z.date(),
      endedAt: z.date().nullable(),
      /**
       * The key is the media id, the value is the duration of seconds spent viewing that media.
       */
      viewedMedias: z.record(z.string().regex(/\d+/), z.number()),
      notes: z.string(),
    })
    .nullable(),
});

export interface SessionStore extends z.infer<typeof sessionStoreSchema> {
  newSession: () => void;
  clearSession: () => void;
  toggleSideMenu: () => void;
  closeSideMenu: () => void;
  setViewedConsultationId: (id: string | undefined) => void;
  setSessionName: (name: string) => void;
  setSessionNotes: (notes: string) => void;
  showConsultation: () => boolean;
  incrementMediaViewDuration: (mediaId: number) => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      showSideMenu: false,
      activeSession: null,
      toggleSideMenu: () =>
        set((state) => ({ showSideMenu: !state.showSideMenu })),
      closeSideMenu: () => set({ showSideMenu: false }),
      newSession: () =>
        set((_state) => {
          return {
            activeSession: {
              name: '',
              startedAt: new Date(),
              endedAt: null,
              viewedMedias: {},
              notes: '',
            },
          };
        }),
      setSessionName: (name) =>
        set((state) => {
          if (state.activeSession === null) return {};

          return {
            activeSession: {
              ...state.activeSession,
              name,
            },
          };
        }),
      setSessionNotes: (notes) =>
        set((state) => {
          if (state.activeSession === null) return {};

          return {
            activeSession: {
              ...state.activeSession,
              notes,
            },
          };
        }),
      showConsultation: () =>
        get().activeSession !== null ||
        get().viewedConsultationId !== undefined,
      setViewedConsultationId: (id) => set({ viewedConsultationId: id }),
      clearSession: () => set({ activeSession: null }),
      incrementMediaViewDuration: (mediaId) =>
        set((state) => {
          if (state.activeSession === null) return {};

          return {
            activeSession: {
              ...state.activeSession,
              viewedMedias: {
                ...state.activeSession.viewedMedias,
                [mediaId]: (state.activeSession.viewedMedias[mediaId] ?? 0) + 1,
              },
            },
          };
        }),
    }),
    {
      name: 'session-storage',
      skipHydration: true,
    }
  )
);
