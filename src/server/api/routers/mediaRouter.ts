import { createMediaSchema, updateMediaSchema } from '@/schemas/mediaSchemas';
import { db } from '@/server/db';
import {
  TenantRole,
  media,
  mediaView,
  theme,
  themeMedia,
  userAccount,
  userAccountFavoriteMedia,
} from '@/server/db/schema';
import { incrementMediaViewCount } from '@/server/db/services/media';
import { TRPCError } from '@trpc/server';
import { SQL, and, eq, ilike, inArray, notInArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { userHasAnyOfTenantRoles } from '@/server/db/services/tenant';

export const mediaRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        onlyPublished: z.boolean().optional().default(false),
        onlyPersonal: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const conditions = [
        input.name && ilike(media.name, `%${input.name}%`),
        input.onlyPublished && eq(media.published, true),
        input.onlyPersonal && eq(media.createdBy, ctx.session.user.id),
      ].filter(Boolean) as SQL[];

      return await db
        .select({
          id: media.id,
          name: media.name,
          published: media.published,
          shortDescription: media.shortDescription,
          createdByName: userAccount.fullName,
          associations: sql<number>`COUNT(DISTINCT ${themeMedia.themeId})`,
          views: sql<number>`COUNT(DISTINCT ${mediaView.id})`,
          createdAt: media.createdAt,
          updatedAt: media.updatedAt,
          type: media.type,
        })
        .from(media)
        .leftJoin(userAccount, eq(userAccount.id, media.createdBy))
        .leftJoin(themeMedia, eq(themeMedia.mediaId, media.id))
        .leftJoin(mediaView, eq(mediaView.mediaId, media.id))
        .where(and(...conditions))
        .groupBy(media.id, userAccount.id);
    }),

  /**
   * Finds a media by its id.
   */
  getById: protectedProcedure
    .input(z.number().positive())
    .query(async ({ input: id, ctx }) => {
      const results = await db
        .select({
          id: media.id,
          name: media.name,
          shortDescription: media.shortDescription,
          content: media.content,
          published: media.published,
          createdBy: {
            id: userAccount.id,
            name: userAccount.fullName,
          },
          createdAt: media.createdAt,
          updatedAt: media.updatedAt,
          theme: {
            id: theme.id,
            name: theme.name,
          },
          type: media.type,
        })
        .from(media)
        .where(eq(media.id, id))
        .innerJoin(userAccount, eq(userAccount.id, media.createdBy))
        .leftJoin(themeMedia, eq(themeMedia.mediaId, media.id))
        .leftJoin(theme, eq(theme.id, themeMedia.themeId));

      if (results.length === 0)
        throw new TRPCError({
          code: 'NOT_FOUND',
        });

      incrementMediaViewCount(id, ctx.session.user.id);

      const first = results[0]!;
      const result = {
        id: first.id,
        name: first.name,
        shortDescription: first.shortDescription,
        content: first.content,
        published: first.published,
        createdBy: first.createdBy,
        createdAt: first.createdAt,
        updatedAt: first.updatedAt,
        themes: results.map((r) => r.theme),
        type: first.type,
      };

      return result;
    }),

  /**
   * Finds a list of medias by their ids and includes its related themes.
   */
  getByIdsWithThemes: protectedProcedure
    .input(z.array(z.number()))
    .query(async ({ input }) => {
      if (input.length === 0) return [];

      return await db.query.media.findMany({
        columns: {
          id: true,
          name: true,
          shortDescription: true,
        },
        with: {
          themes: {
            columns: {},
            with: {
              theme: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        where: inArray(media.id, input),
      });
    }),

  /**
   * Creates a new media.
   */
  create: protectedProcedure
    .input(createMediaSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await db
        .insert(media)
        .values({
          name: input.name,
          content: input.content,
          createdBy: ctx.session.user.id,
          published: input.published,
          type: input.type,
        })
        .returning({
          id: media.id,
        });

      if (input.themeIds.length > 0) {
        await db.insert(themeMedia).values(
          input.themeIds.map((themeId) => ({
            themeId,
            mediaId: result[0]!.id,
          }))
        );
      }

      return result;
    }),

  /**
   * Updates an existing media, replacing its content with the new content.
   */
  update: protectedProcedure
    .input(updateMediaSchema)
    .mutation(async ({ input }) => {
      const conditions = [
        eq(themeMedia.mediaId, input.id),
        input.themeIds.length !== 0 &&
          notInArray(themeMedia.themeId, input.themeIds),
      ].filter(Boolean) as SQL[];

      await db.delete(themeMedia).where(and(...conditions));

      if (input.themeIds.length !== 0) {
        await db
          .insert(themeMedia)
          .values(
            input.themeIds.map((themeId) => ({
              mediaId: input.id,
              themeId,
            }))
          )
          .onConflictDoNothing();
      }

      const result = await db
        .update(media)
        .set({
          name: input.name,
          shortDescription: input.shortDescription,
          published: input.published,
          content: input.content,
          updatedAt: new Date(),
          type: input.type,
        })
        .where(eq(media.id, input.id))
        .returning();

      return result[0];
    }),

  /**
   * Resets the views of all registered media.
   */
  resetViews: protectedProcedure
    .input(z.string())
    .mutation(async ({ input: tenantId, ctx }) => {
      const permitted = await userHasAnyOfTenantRoles(
        tenantId,
        ctx.session.user.id,
        [TenantRole.OWNER, TenantRole.SUPER_USER]
      );

      if (!permitted) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not allowed to reset the views of all media.',
        });
      }

      await db.execute(sql`DELETE FROM ${mediaView} WHERE 1=1`);

      return {
        message: 'Views reset successfully.',
      };
    }),

  /**
   * Deletes a media by its id.
   */
  deleteById: protectedProcedure
    .input(z.number().positive())
    .mutation(async ({ input }) => {
      await db.delete(themeMedia).where(eq(themeMedia.mediaId, input));
      await db.delete(mediaView).where(eq(mediaView.mediaId, input));
      await db
        .delete(userAccountFavoriteMedia)
        .where(eq(userAccountFavoriteMedia.mediaId, input));
      await db.delete(media).where(eq(media.id, input));
    }),
});
