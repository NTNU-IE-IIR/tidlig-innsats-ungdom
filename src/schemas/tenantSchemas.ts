import { z } from 'zod';

/**
 * Common schema for modifying a users membership in a tenant.
 */
export const modifyTenantMembershipSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.string().optional(),
});
