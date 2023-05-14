import { z } from 'zod';
import { create } from 'zustand';

const themeStoreSchema = z.object({
  selectedThemeIds: z.set(z.number()),
});

export interface ThemeStore extends z.infer<typeof themeStoreSchema> {
  toggleTheme: (themeId: number) => void;
  clearSelection: () => void;
  isSelected: (themeId: number) => boolean;
}

export const useThemeStore = create<ThemeStore>()((set, get) => ({
  selectedThemeIds: new Set(),
  clearSelection: () => set({ selectedThemeIds: new Set() }),
  toggleTheme: (themeId) =>
    set((state) => {
      const selectedThemeIds = state.selectedThemeIds;

      if (selectedThemeIds.has(themeId)) {
        selectedThemeIds.delete(themeId);
      } else {
        selectedThemeIds.add(themeId);
      }

      return { selectedThemeIds };
    }),
  isSelected: (themeId) => get().selectedThemeIds.has(themeId),
}));
