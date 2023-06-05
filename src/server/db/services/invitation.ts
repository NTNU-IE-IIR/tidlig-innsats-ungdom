import { and, eq, sql } from 'drizzle-orm';
import { db } from '..';
import { invitation, tenantUserAccount } from '../schema';

/**
 * Finds a non expired invitation with a given id.
 *
 * @param code the code of the invitation to find
 *
 * @returns the found invitation
 */
export const findNonExpiredInvitationByCode = async (code: string) => {
  return await db
    .select({
      id: invitation.id,
      tenantId: invitation.tenantId,
      maxUses: invitation.maxUses,
      uses: sql<number>`COUNT(DISTINCT ${tenantUserAccount.userAccountId})`,
    })
    .from(invitation)
    .leftJoin(
      tenantUserAccount,
      eq(invitation.id, tenantUserAccount.invitationId)
    )
    .where(and(eq(invitation.code, code), sql`${invitation.expiresAt} > NOW()`))
    .groupBy(invitation.id);
};
