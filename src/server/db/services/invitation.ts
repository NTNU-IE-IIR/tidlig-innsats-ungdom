import { and, eq, sql } from 'drizzle-orm';
import { db } from '..';
import { invitation } from '../schema';

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
    })
    .from(invitation)
    .where(
      and(eq(invitation.code, code), sql`${invitation.expiresAt} > NOW()`)
    );
};
