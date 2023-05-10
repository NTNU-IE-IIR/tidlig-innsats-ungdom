import { createMediaSchema } from '@/schemas/mediaSchemas';
import { db } from '@/server/db';
import {
  MediaType,
  media,
  theme,
  themeMedia,
  userAccount,
} from '@/server/db/schema';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const mediaRouter = createTRPCRouter({
  /**
   * Finds a media by its id.
   */
  getById: protectedProcedure
    .input(z.number().positive())
    .query(async ({ input: id }) => {
      const results = await db
        .select({
          id: media.id,
          content: media.content,
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
        content: first.content,
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
          content: input.content,
          createdBy: ctx.session.user.id,
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
});
