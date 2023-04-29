import { db } from '@/db';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { applicationSettings, userAccount } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export const appSettingsRouter = createTRPCRouter({
  uninitialized: publicProcedure.query(async () => {
    const results = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(userAccount)
      .groupBy(userAccount.id)
      .limit(1);

    if (results.length === 0) return true;

    return results[0]!.count === 0;
  }),
  registrationEnabled: publicProcedure.query(async () => {
    const results = await db
      .select({ value: applicationSettings.value })
      .from(applicationSettings)
      .where(eq(applicationSettings.name, 'USER_REGISTRATION_ENABLED'))
      .limit(1);

    if (results.length === 0) return true;

    return results[0]?.value === true;
  }),
});
