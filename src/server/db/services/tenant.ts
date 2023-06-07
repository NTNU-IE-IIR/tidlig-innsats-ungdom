import { and, eq } from 'drizzle-orm';
import { db } from '..';
import { TenantRole, tenantUserAccount } from '../schema';

/**
 * Checks whether a user has a specific role in a tenant.
 *
 * @param tenantId the id of the tenant to check in
 * @param userId the id of the user to check
 * @param role the role to check for
 *
 * @returns true if the user has the role, false otherwise
 */
export const userHasTenantRole = async (
  tenantId: string,
  userId: string,
  role: TenantRole
) => {
  const results = await db
    .select({
      userId: tenantUserAccount.userAccountId,
      tenantId: tenantUserAccount.tenantId,
      role: tenantUserAccount.role,
    })
    .from(tenantUserAccount)
    .where(
      and(
        eq(tenantUserAccount.tenantId, tenantId),
        eq(tenantUserAccount.userAccountId, userId)
      )
    );

  if (results.length === 0) {
    return false;
  }

  return results[0]!.role === role;
};
