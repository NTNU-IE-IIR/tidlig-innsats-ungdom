import { createThemeSchema, updateThemeSchema } from '@/schemas/themeSchemas';
import { db } from '@/server/db';
import { theme } from '@/server/db/schema';
import { ThemeNode } from '@/types/themes';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const themeRouter = createTRPCRouter({
  /**
   * Adds a new theme.
   */
  addTheme: protectedProcedure
    .input(createThemeSchema)
    .mutation(async ({ input, ctx }) => {
      const results = await db
        .insert(theme)
        .values({
          name: input.name,
          parentId: input.parentId,
          createdBy: ctx.session.user.id,
        })
        .returning();

      return results[0];
    }),

  /**
   * Updates an existing theme.
   */
  updateTheme: protectedProcedure
    .input(updateThemeSchema)
    .mutation(async ({ input }) => {
      const results = await db
        .update(theme)
        .set({
          name: input.name,
          parentId: input.parentId,
        })
        .where(eq(theme.id, input.id))
        .returning();

      return results[0];
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
