import { and, eq } from 'drizzle-orm';
import { db } from '..';
import { TenantRole, tenantUserAccount } from '../schema';

/**
 * Checks whether a user is in a tenant.
 *
 * @param tenantId the id of the tenant to check in
 * @param userId the id of the user to check
 *
 * @returns true if the user is in the tenant, false otherwise
 */
export const userIsInTenant = async (tenantId: string, userId: string) => {
  const results = await db
    .select({
      userId: tenantUserAccount.userAccountId,
      tenantId: tenantUserAccount.tenantId,
    })
    .from(tenantUserAccount)
    .where(
      and(
        eq(tenantUserAccount.tenantId, tenantId),
        eq(tenantUserAccount.userAccountId, userId)
      )
    );

  return results.length > 0;
};

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

/**
 * Checks whether a user has any of the specified roles in a tenant.
 *
 * @param tenantId the id of the tenant to check in
 * @param userId the id of the user to check
 * @param roles the roles to check for
 *
 * @returns true if the user has any of the roles, false otherwise
 */
export const userHasAnyOfTenantRoles = async (
  tenantId: string,
  userId: string,
  roles: TenantRole[]
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

  return roles.includes(results[0]!.role);
};
