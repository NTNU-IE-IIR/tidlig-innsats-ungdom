import { db } from '@/db';
import { theme } from '@/db/schema';
import { and, ilike } from 'drizzle-orm';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const themeRouter = createTRPCRouter({
  listThemes: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await db
        .select({
          id: theme.id,
          name: theme.name,
        })
        .from(theme)
        .where(and(ilike(theme.name, `%${input.name}%`)));
    }),
});
