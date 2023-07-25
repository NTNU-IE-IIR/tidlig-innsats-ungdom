import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
  roleProtectedProcedure,
} from '../trpc';
import { db } from '@/server/db';
import { UserAccountRole, applicationSettings } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

const HELP_CONTENT_KEY = 'HELP_CONTENT';

export const helpRouter = createTRPCRouter({
  getHelpContent: protectedProcedure.query(async () => {
    const result = await db
      .select()
      .from(applicationSettings)
      .where(eq(applicationSettings.name, HELP_CONTENT_KEY));

    return {
      content: result[0]?.value,
    };
  }),

  setHelpContent: roleProtectedProcedure(UserAccountRole.GLOBAL_ADMIN)
    .input(
      z.object({
        content: z.any(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .insert(applicationSettings)
        .values({
          name: HELP_CONTENT_KEY,
          value: input.content,
        })
        .onConflictDoUpdate({
          set: {
            value: input.content,
          },
          target: applicationSettings.name,
          where: eq(applicationSettings.name, HELP_CONTENT_KEY),
        });

      return {};
    }),
});
