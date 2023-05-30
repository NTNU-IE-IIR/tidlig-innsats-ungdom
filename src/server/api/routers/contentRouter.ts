import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { db } from '@/server/db';
import { sql } from 'drizzle-orm';
import { media, theme, themeMedia } from '@/server/db/schema';

export const contentRouter = createTRPCRouter({
  /**
   * Lists the content (theme and potentially media) in the current drill level.
   * If no parent id is present, then the root themes are listed.
   * Media has to be marked as published in order for it to be listed.
   */
  listContent: protectedProcedure
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
        shortDescription: string;
        discriminator: 'THEME' | 'MEDIA';
      }>(sql`
        SELECT 
          ${theme.id} AS id,
          ${theme.name} AS name,
          ${theme.shortDescription} AS "shortDescription",
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
          ${media.shortDescription} AS "shortDescription",
          'MEDIA' AS discriminator
        FROM ${themeMedia}
        INNER JOIN ${media} ON ${themeMedia.mediaId} = ${media.id}
        WHERE 
          (${themeMedia.themeId} = ${parentId}) AND
          (${media.name} ILIKE '%' || ${name} || '%') AND
          (${media.published} = TRUE)
        ORDER BY discriminator DESC
      `);

      return result.rows;
    }),
});
