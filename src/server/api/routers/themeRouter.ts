import { db } from '@/server/db';
import { media, theme, themeMedia } from '@/server/db/schema';
import { ThemeNode } from '@/types/themes';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const themeRouter = createTRPCRouter({
  /**
   * Lists the themes in the current drill level.
   * If no parent id is present, then the root themes are listed.
   */
  listThemes: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        parentId: z.number().or(z.string().regex(/\d+/gi)).optional(),
      })
    )
    .query(async ({ input }) => {
      const parentId = input.parentId ?? null;
      const name = input.name ?? null;

      const result = await db.execute<{
        id: number;
        name: string;
        discriminator: 'THEME' | 'MEDIA';
      }>(sql`
        SELECT 
          ${theme.id} AS id,
          ${theme.name} AS name,
          'THEME' AS discriminator
        FROM ${theme}
        WHERE 
          (
            (${parentId}::bigint IS NULL AND ${theme.parentId} IS NULL) OR
            (${theme.parentId} = ${parentId})
          ) AND 
          (${theme.name} ILIKE '%' || ${name} || '%')
        UNION
        SELECT
          ${media.id} AS id,
          ${media.name} AS name,
          'MEDIA' AS discriminator
        FROM ${themeMedia}
        INNER JOIN ${media} ON ${themeMedia.mediaId} = ${media.id}
        WHERE 
          (${themeMedia.themeId} = ${parentId}) AND
          (${media.name} ILIKE '%' || ${name} || '%') AND
          (${media.published} = TRUE)
      `);

      return result.rows;
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
