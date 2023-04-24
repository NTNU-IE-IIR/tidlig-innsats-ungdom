import { db } from '@/db';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { userAccount } from '@/db/schema';
import { sql } from 'drizzle-orm';

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
});
