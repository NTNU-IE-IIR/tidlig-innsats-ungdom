import { createMediaSchema, updateMediaSchema } from '@/schemas/mediaSchemas';
import { db } from '@/server/db';
import { media, theme, themeMedia, userAccount } from '@/server/db/schema';
import { TRPCError } from '@trpc/server';
import { SQL, and, eq, ilike, notInArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

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
          createdAt: media.createdAt,
          updatedAt: media.updatedAt,
          type: media.type,
        })
        .from(media)
        .leftJoin(userAccount, eq(userAccount.id, media.createdBy))
        .leftJoin(themeMedia, eq(themeMedia.mediaId, media.id))
        .where(and(...conditions))
        .groupBy(media.id, userAccount.id);
    }),

  /**
   * Finds a media by its id.
   */
  getById: protectedProcedure
    .input(z.number().positive())
    .query(async ({ input: id }) => {
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
      };

      return result;
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
      await db
        .delete(themeMedia)
        .where(
          and(
            eq(themeMedia.mediaId, input.id),
            notInArray(themeMedia.themeId, input.themeIds)
          )
        );

      await db
        .insert(themeMedia)
        .values(
          input.themeIds.map((themeId) => ({
            mediaId: input.id,
            themeId,
          }))
        )
        .onConflictDoNothing();

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
   * Deletes a media by its id.
   */
  deleteById: protectedProcedure
    .input(z.number().positive())
    .mutation(async ({ input }) => {
      await db.delete(themeMedia).where(eq(themeMedia.mediaId, input));
      await db.delete(media).where(eq(media.id, input));
    }),
});
