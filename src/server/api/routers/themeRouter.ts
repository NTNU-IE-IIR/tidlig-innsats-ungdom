import { db } from '@/server/db';
import { theme } from '@/server/db/schema';
import { SQL, and, eq, ilike, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ThemeNode } from '@/types/themes';

export const themeRouter = createTRPCRouter({
  /**
   * Lists the themes in the current drill level.
   * If no parent id is present, then the root themes are listed.
   */
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

  /**
   * Lists the themes in a tree structure.
   * The root themes are listed, in no specific order.
   */
  listThemeTree: protectedProcedure.input(z.object({})).query(async () => {
    const results = await db
      .select({
        id: theme.id,
        name: theme.name,
        parentId: theme.parentId,
      })
      .from(theme);

    const nodeMap = new Map<number, ThemeNode>();
    const rootNodes: ThemeNode[] = [];

    for (const current of results) {
      const node = {
        id: current.id,
        name: current.name,
        children: [],
      };

      if (current.parentId) {
        const parent = nodeMap.get(current.parentId);
        if (parent) parent.children.push(node);
      } else {
        rootNodes.push(node);
      }

      nodeMap.set(current.id, node);
    }

    return rootNodes;
  }),
});
