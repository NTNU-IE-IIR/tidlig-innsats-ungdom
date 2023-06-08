import { TenantRole } from '@/server/db/schema';
import { z } from 'zod';
import { create } from 'zustand';

const tenantStoreSchema = z.object({
  activeTenantId: z.string().uuid().nullable(),
  activeTenantName: z.string().nullable(),
  activeTenantRole: z.nativeEnum(TenantRole).nullable(),
});

export interface TenantStore extends z.infer<typeof tenantStoreSchema> {
  setActiveTenant: (
    tenantId: string,
    tenantName: string,
    role: TenantRole
  ) => void;
  clearActiveTenant: () => void;
}

export const useTenantStore = create<TenantStore>()((set) => ({
  activeTenantId: null,
  activeTenantName: null,
  activeTenantRole: null,
  setActiveTenant: (tenantId, tenantName, role) =>
    set({
      activeTenantId: tenantId,
      activeTenantName: tenantName,
      activeTenantRole: role,
    }),
  clearActiveTenant: () =>
    set({ activeTenantId: null, activeTenantName: null }),
}));
