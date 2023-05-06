import { db } from '@/server/db';
import { theme } from '@/server/db/schema';
import { SQL, and, eq, ilike, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const themeRouter = createTRPCRouter({
  listThemes: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        parentId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const conditions = [
        input.name !== undefined && ilike(theme.name, `%${input.name}%`),
        input.parentId !== undefined
          ? eq(theme.parentId, input.parentId)
          : isNull(theme.parentId),
      ].filter(Boolean) as SQL[];

      return await db
        .select({
          id: theme.id,
          name: theme.name,
        })
        .from(theme)
        .where(and(...conditions));
    }),
});
