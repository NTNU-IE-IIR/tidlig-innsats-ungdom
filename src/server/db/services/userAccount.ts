import { SQL, and, eq, sql } from 'drizzle-orm';
import { db } from '..';
import { UserAccountRole, userAccount } from '../schema';

/**
 * Finds a user account by it's registered email address.
 *
 * @param email the email address find a user account by
 *
 * @returns the user account if found, otherwise null
 */
export const findByEmail = async (email: string) => {
  const results = await db
    .select()
    .from(userAccount)
    .where(eq(userAccount.email, email));

  if (results.length === 0) return null;

  return results[0];
};

/**
 * Checks if there are any user accounts registered with the given email address.
 *
 * @param params the parameters to use for checking the existance of a user account
 *
 * @returns true if there is at least one user account matching the given parameters, otherwise false
 */
export const hasRegisteredUserAccounts = async (params: {
  email?: string;
  role?: UserAccountRole;
}) => {
  const conditions = [
    params.email !== undefined && eq(userAccount.email, params.email),
    params.role !== undefined && eq(userAccount.role, params.role),
  ].filter(Boolean) as SQL[];

  const results = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(userAccount)
    .where(and(...conditions))
    .groupBy(userAccount.id)
    .limit(1);

  if (results.length === 0) return false;

  return results[0]!.count !== 0;
};
