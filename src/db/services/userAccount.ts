import { eq } from 'drizzle-orm';
import { db } from '..';
import { userAccount } from '../schema';

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
