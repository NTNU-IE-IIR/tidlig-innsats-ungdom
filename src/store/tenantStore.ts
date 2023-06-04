import { z } from 'zod';
import { create } from 'zustand';

const tenantStoreSchema = z.object({
  activeTenantId: z.string().uuid().nullable(),
  activeTenantName: z.string().nullable(),
});

export interface TenantStore extends z.infer<typeof tenantStoreSchema> {
  setActiveTenant: (tenantId: string, tenantName: string) => void;
  clearActiveTenant: () => void;
}

export const useTenantStore = create<TenantStore>()((set) => ({
  activeTenantId: null,
  activeTenantName: null,
  setActiveTenant: (tenantId, tenantName) =>
    set({ activeTenantId: tenantId, activeTenantName: tenantName }),
  clearActiveTenant: () =>
    set({ activeTenantId: null, activeTenantName: null }),
}));
