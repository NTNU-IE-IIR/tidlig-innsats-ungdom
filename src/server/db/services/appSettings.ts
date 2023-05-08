import { eq } from 'drizzle-orm';
import { db } from '..';
import { applicationSettings } from '../schema';

/**
 * Returns true if user registration is enabled, otherwise false.
 *
 * @returns true if user registration is enabled, otherwise false
 */
export const isUserRegistrationEnabled = async () => {
  const results = await db
    .select({ value: applicationSettings.value })
    .from(applicationSettings)
    .where(eq(applicationSettings.name, 'USER_REGISTRATION_ENABLED'))
    .limit(1);

  if (results.length === 0) return true;

  return results[0]?.value === true;
};
