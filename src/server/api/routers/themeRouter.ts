import { createThemeSchema, updateThemeSchema } from '@/schemas/themeSchemas';
import { db } from '@/server/db';
import {
  theme,
  themeMedia,
  userAccountFavoriteTheme,
} from '@/server/db/schema';
import { ThemeNode } from '@/types/themes';
import { SQL, and, eq, notInArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const themeRouter = createTRPCRouter({
  /**
   * Gets a theme by its ID.
   */
  getThemeById: protectedProcedure
    .input(z.number().positive())
    .query(async ({ input }) => {
      const results = await db.select().from(theme).where(eq(theme.id, input));

      return results[0]!;
    }),

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
          shortDescription: input.shortDescription,
          iconUrl: input.iconUrl,
          parentId: input.parentId,
          createdBy: ctx.session.user.id,
        })
        .returning();

      return results[0]!;
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
          shortDescription: input.shortDescription,
          parentId: input.parentId,
          iconUrl: input.iconUrl,
        })
        .where(eq(theme.id, input.id))
        .returning();

      return results[0]!;
    }),

  /**
   * Deletes an existing theme by its ID.
   * This will recursively delete all child themes.
   */
  deleteThemeById: protectedProcedure
    .input(
      z.object({
        id: z.number().positive(),
        bubbleChildren: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.delete(themeMedia).where(eq(themeMedia.themeId, input.id));
      await db
        .delete(userAccountFavoriteTheme)
        .where(eq(userAccountFavoriteTheme.themeId, input.id));

      if (input.bubbleChildren) {
        await db
          .update(theme)
          .set({
            parentId: null,
          })
          .where(eq(theme.parentId, input.id));

        await db.delete(theme).where(eq(theme.id, input.id));
      } else {
        await db.execute(
          sql`
            DELETE FROM ${theme} WHERE ${theme.id} IN (WITH RECURSIVE child_themes AS (
              SELECT 
                theme_id,
                fk_parent_theme_id
              FROM theme
              WHERE theme_id = ${input.id}
              UNION
              SELECT
                theme.theme_id,
                theme.fk_parent_theme_id
              FROM theme
              INNER JOIN child_themes ON theme.fk_parent_theme_id = child_themes.theme_id 
            )
            SELECT theme_id FROM child_themes)
          `
        );
      }
    }),

  /**
   * Lists the themes in a tree structure.
   * The root themes are listed, in no specific order.
   */
  listThemeTree: protectedProcedure
    .input(
      z.object({
        excludeIds: z.array(z.number().positive()).optional(),
      })
    )
    .query(async ({ input }) => {
      const conditions = [
        input.excludeIds && notInArray(theme.id, input.excludeIds),
      ].filter(Boolean) as SQL[];

      const results = await db
        .select({
          id: theme.id,
          name: theme.name,
          parentId: theme.parentId,
        })
        .from(theme)
        .where(and(...conditions));

      const nodeMap = new Map<number, ThemeNode>();
      const rootNodes: ThemeNode[] = [];

      // we have to do two passes here, because we need to make sure the
      // map contains the parent nodes, since we currently cannot guarantee
      // the order of the results.
      for (const current of results) {
        const node = {
          id: current.id,
          name: current.name,
          parentId: current.parentId ?? undefined,
          children: [],
        };

        nodeMap.set(current.id, node);
        if (!current.parentId) rootNodes.push(node);
      }

      for (const node of nodeMap.values()) {
        if (node.parentId) {
          const parent = nodeMap.get(node.parentId);
          if (parent) parent.children.push(node);
        }
      }

      return rootNodes;
    }),
});
