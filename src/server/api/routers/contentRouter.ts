import { db } from '@/server/db';
import { media, theme, themeMedia } from '@/server/db/schema';
import { Content, ContentDiscriminator } from '@/types/content';
import { SQL, and, eq, ilike, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

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
        parentId: z
          .number()
          .or(z.string().regex(/\d+/gi))
          .transform((n) => Number(n))
          .optional(),
      })
    )
    .query(async ({ input }) => {
      const parentId = input.parentId ?? null;
      const name = input.name ?? '';

      let medias: Content[] = [];

      const conditions = [
        parentId ? eq(theme.parentId, parentId) : isNull(theme.parentId),
        name && ilike(theme.name, `%${name}%`),
      ].filter(Boolean) as SQL[];

      const themes = await db
        .select({
          id: theme.id,
          name: theme.name,
          shortDescription: theme.shortDescription,
          discriminator: sql<ContentDiscriminator>`'THEME'`,
        })
        .from(theme)
        .where(and(...conditions));

      if (parentId) {
        medias = await db
          .select({
            id: media.id,
            name: media.name,
            shortDescription: media.shortDescription,
            discriminator: sql<ContentDiscriminator>`'MEDIA'`,
          })
          .from(themeMedia)
          .innerJoin(media, eq(themeMedia.mediaId, media.id))
          .where(
            and(
              eq(themeMedia.themeId, parentId),
              ilike(media.name, `%${name}%`),
              eq(media.published, true)
            )
          );
      }

      return {
        themes,
        medias,
      };
    }),
});
