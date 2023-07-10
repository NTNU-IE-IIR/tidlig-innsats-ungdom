import { db } from '@/server/db';
import {
  media,
  theme,
  themeMedia,
  userAccountFavoriteMedia,
  userAccountFavoriteTheme,
} from '@/server/db/schema';
import { Content, ContentDiscriminator, FavoriteType } from '@/types/content';
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

      if (input.favoritesOnly) {
        const results = await db.execute<any>(sql<Content>`
          WITH RECURSIVE theme_hierarchy AS (
            SELECT 
              t.theme_id, 
              t.fk_parent_theme_id, 
              t.short_description,
              t.name,
              1 AS level
            FROM theme t
            WHERE 
              (${parentId}::bigint IS NULL AND t.fk_parent_theme_id IS NULL) OR
              (${parentId}::bigint IS NOT NULL AND t.fk_parent_theme_id = ${parentId})
            UNION ALL
            SELECT 
              t2.theme_id, 
              t2.fk_parent_theme_id, 
              t2.short_description,
              t2.name, 
              th.level + 1
            FROM theme t2
            INNER JOIN theme_hierarchy th 
              ON t2.fk_parent_theme_id = th.theme_id
          )
          SELECT 
            th.theme_id, 
            th.name,
            th.short_description,
            'THEME' AS discriminator,
            CASE
              WHEN ut.created_at IS NOT NULL THEN 'DIRECT'
              WHEN uf.created_at IS NOT NULL THEN 'INDIRECT'
              ELSE 'NONE'
            END AS favorited
          FROM theme_hierarchy th
          INNER JOIN theme_media tm ON th.theme_id = tm.fk_theme_id
          LEFT JOIN user_account_favorite_media uf 
            ON tm.fk_media_id = uf.fk_media_id
            AND uf.fk_user_account_id = ${ctx.session.user.id}
          LEFT JOIN user_account_favorite_theme ut ON th.theme_id = ut.fk_theme_id
            AND ut.fk_user_account_id = ${ctx.session.user.id}
          WHERE 
            (th.level = 1) AND
            (uf.created_at IS NOT NULL OR ut.created_at IS NOT NULL OR ${parentId}::bigint IS NULL)
          GROUP BY th.theme_id, th.name, th.short_description, favorited
        `);
        themes = results.rows;
      } else {
        const conditions = [
          parentId ? eq(theme.parentId, parentId) : isNull(theme.parentId),
          name && ilike(theme.name, `%${name}%`),
          input.favoritesOnly
            ? isNotNull(userAccountFavoriteTheme.createdAt)
            : null,
        ].filter(Boolean) as SQL[];

        themes = await db
          .select({
            id: theme.id,
            name: theme.name,
            shortDescription: theme.shortDescription,
            discriminator: sql<ContentDiscriminator>`'THEME'`,
            favorited: sql<FavoriteType>`CASE WHEN ${userAccountFavoriteTheme.createdAt} IS NOT NULL THEN 'DIRECT' ELSE 'NONE' END`,
          })
          .from(theme)
          .leftJoin(
            userAccountFavoriteTheme,
            eq(theme.id, userAccountFavoriteTheme.themeId)
          )
          .where(and(...conditions))
          .orderBy(desc(isNotNull(userAccountFavoriteTheme.createdAt)));
      }

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
            discriminator: sql<ContentDiscriminator>`'MEDIA'`,
            favorited: sql<FavoriteType>`CASE WHEN ${userAccountFavoriteMedia.createdAt} IS NOT NULL THEN 'DIRECT' ELSE 'NONE' END`,
          })
          .from(themeMedia)
          .innerJoin(media, eq(themeMedia.mediaId, media.id))
          .leftJoin(
            userAccountFavoriteMedia,
            eq(userAccountFavoriteMedia.mediaId, media.id)
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
