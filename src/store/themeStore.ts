import { z } from 'zod';
import { create } from 'zustand';

const themeStoreSchema = z.object({
  selectedThemeIds: z.set(z.number()),
});

export interface ThemeStore extends z.infer<typeof themeStoreSchema> {
  toggleTheme: (themeId: number) => void;
  clearSelection: () => void;
  isSelected: (themeId: number) => boolean;
  isEqual: (themes: number[]) => boolean;
  set: (themes: number[]) => void;
}

export const useThemeStore = create<ThemeStore>()((set, get) => ({
  selectedThemeIds: new Set(),
  clearSelection: () => set({ selectedThemeIds: new Set() }),
  isEqual: (themes) => {
    const intersect = new Set<number>(themes);
    const selectedThemeIds = get().selectedThemeIds;

    if (selectedThemeIds.size !== intersect.size) {
      return false;
    }

    for (const themeId of selectedThemeIds) {
      if (!intersect.has(themeId)) {
        return false;
      }
    }

    return true;
  },
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
  set: (themes) => set({ selectedThemeIds: new Set(themes) }),
}));
