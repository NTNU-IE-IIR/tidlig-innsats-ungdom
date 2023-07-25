import { db } from '@/server/db';
import {
  media,
  theme,
  themeMedia,
  userAccountFavoriteMedia,
  userAccountFavoriteTheme,
} from '@/server/db/schema';
import { Content, ContentDiscriminator } from '@/types/content';
import { SQL, and, desc, eq, ilike, isNotNull, isNull, sql } from 'drizzle-orm';
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
        favoritesOnly: z.boolean(),
      })
    )
    .query(async ({ input, ctx }) => {
      const parentId = input.parentId ?? null;
      const name = input.name ?? '';

      let medias: Content[] = [];
      let themes: Content[] = [];

      const result = await db.execute<any>(sql<Content[]>`
        WITH RECURSIVE theme_hierarchy AS (
          SELECT theme_id, fk_parent_theme_id, name
          FROM theme
          WHERE fk_parent_theme_id IS NULL
          
          UNION ALL
          
          SELECT t.theme_id, t.fk_parent_theme_id, t.name
          FROM theme t
          JOIN theme_hierarchy th ON t.fk_parent_theme_id = th.theme_id
        ),
        theme_media_hierarchy AS (
          SELECT th.theme_id, tm.fk_media_id
          FROM theme_hierarchy th
          LEFT JOIN theme_media tm ON th.theme_id = tm.fk_theme_id
          LEFT JOIN user_account_favorite_media uf 
            ON tm.fk_media_id = uf.fk_media_id 
            AND uf.fk_user_account_id = ${ctx.session.user.id}
        )
        SELECT 
          DISTINCT th.theme_id AS id,
          th.name,
          t.short_description AS "shortDescription",
          t.icon_url AS "iconUrl",
          'THEME' AS discriminator,
          (CASE WHEN tmh.fk_media_id IS NOT NULL THEN TRUE ELSE FALSE END) AS favorited
        FROM theme_hierarchy th
        INNER JOIN theme t ON th.theme_id = t.theme_id
        LEFT JOIN theme_media_hierarchy tmh ON th.theme_id = tmh.theme_id
        WHERE 
          th.fk_parent_theme_id = ${parentId}::bigint OR (th.fk_parent_theme_id IS NULL AND ${parentId}::bigint IS NULL) AND
          CASE WHEN ${input.favoritesOnly} THEN tmh.fk_media_id IS NOT NULL ELSE TRUE END AND
          th.name ILIKE '%' || ${name} || '%'
        ORDER BY favorited DESC
      `);

      themes = result.rows;

      if (parentId) {
        const mediaConditions = [
          eq(themeMedia.themeId, parentId),
          name && ilike(media.name, `%${name}%`),
          input.favoritesOnly
            ? isNotNull(userAccountFavoriteMedia.createdAt)
            : null,
        ].filter(Boolean) as SQL[];

        medias = await db
          .select({
            id: media.id,
            name: media.name,
            shortDescription: media.shortDescription,
            iconUrl: sql<string | null>`NULL`,
            discriminator: sql<ContentDiscriminator>`'MEDIA'`,
            favorited: sql<boolean>`${userAccountFavoriteMedia.createdAt} IS NOT NULL`,
          })
          .from(themeMedia)
          .innerJoin(media, eq(themeMedia.mediaId, media.id))
          .leftJoin(
            userAccountFavoriteMedia,
            and(
              eq(userAccountFavoriteMedia.mediaId, media.id),
              eq(userAccountFavoriteMedia.userAccountId, ctx.session.user.id)
            )
          )
          .where(and(...mediaConditions))
          .orderBy(desc(isNotNull(userAccountFavoriteMedia.createdAt)));
      }

      return {
        themes,
        medias,
      };
    }),

  toggleFavoriteContent: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        discriminator: z.enum(['THEME', 'MEDIA']),
        favorited: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.discriminator === 'THEME') {
        if (input.favorited) {
          await db
            .delete(userAccountFavoriteTheme)
            .where(
              and(
                eq(userAccountFavoriteTheme.userAccountId, ctx.session.user.id),
                eq(userAccountFavoriteTheme.themeId, input.id)
              )
            );
        } else {
          await db.insert(userAccountFavoriteTheme).values({
            userAccountId: ctx.session.user.id,
            themeId: input.id,
          });
        }

        return {};
      }

      if (input.favorited) {
        await db
          .delete(userAccountFavoriteMedia)
          .where(
            and(
              eq(userAccountFavoriteMedia.userAccountId, ctx.session.user.id),
              eq(userAccountFavoriteMedia.mediaId, input.id)
            )
          );
      } else {
        await db.insert(userAccountFavoriteMedia).values({
          userAccountId: ctx.session.user.id,
          mediaId: input.id,
        });
      }
    }),
});
