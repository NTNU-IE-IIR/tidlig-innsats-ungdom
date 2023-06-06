import { TenantRole } from '@/server/db/schema';
import { z } from 'zod';
import { registerUserAccountSchema } from './userAccountSchemas';

export const createMemberSchema = z.object({
  tenantId: z.string().uuid(),
  userAccount: registerUserAccountSchema,
  role: z.nativeEnum(TenantRole),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;

/**s
 * Common schema for modifying a users membership in a tenant.
 */
export const modifyTenantMembershipSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.string().optional(),
});
