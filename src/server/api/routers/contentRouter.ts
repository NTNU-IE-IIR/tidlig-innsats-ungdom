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
    .query(async ({ input }) => {
      const parentId = input.parentId ?? null;
      const name = input.name ?? '';

      let medias: Content[] = [];

      const conditions = [
        parentId ? eq(theme.parentId, parentId) : isNull(theme.parentId),
        name && ilike(theme.name, `%${name}%`),
        input.favoritesOnly
          ? isNotNull(userAccountFavoriteTheme.createdAt)
          : null,
      ].filter(Boolean) as SQL[];

      const themes = await db
        .select({
          id: theme.id,
          name: theme.name,
          shortDescription: theme.shortDescription,
          discriminator: sql<ContentDiscriminator>`'THEME'`,
          favorited: sql<boolean>`${userAccountFavoriteTheme.createdAt} IS NOT NULL`,
        })
        .from(theme)
        .leftJoin(
          userAccountFavoriteTheme,
          eq(theme.id, userAccountFavoriteTheme.themeId)
        )
        .where(and(...conditions))
        .orderBy(desc(isNotNull(userAccountFavoriteTheme.createdAt)));

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
            favorited: sql<boolean>`${userAccountFavoriteMedia.createdAt} IS NOT NULL`,
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
