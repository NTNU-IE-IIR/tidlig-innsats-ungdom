import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { db } from '@/server/db';
import {
  consultationSession,
  consultationSessionMedia,
} from '@/server/db/schema';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { endConsultationSchema } from '@/schemas/consultationSchemas';

export const consultationRouter = createTRPCRouter({
  activeConsultation: protectedProcedure.query(async ({ ctx }) => {
    return (
      await db
        .select({
          id: consultationSession.id,
          name: consultationSession.name,
          startedAt: consultationSession.startedAt,
          endedAt: consultationSession.endedAt,
        })
        .from(consultationSession)
        .where(
          and(
            eq(consultationSession.userAccountId, ctx.session.user.id),
            isNull(consultationSession.endedAt)
          )
        )
    )[0];
  }),

  listConsultations: protectedProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      return await db
        .select({
          id: consultationSession.id,
          name: consultationSession.name,
          startedAt: consultationSession.startedAt,
          endedAt: consultationSession.endedAt,
        })
        .from(consultationSession)
        .where(
          and(
            eq(consultationSession.userAccountId, ctx.session.user.id),
            isNotNull(consultationSession.endedAt)
          )
        );
    }),

  newConsultation: protectedProcedure
    .input(z.object({ tenantId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const newConsultation = await db
        .insert(consultationSession)
        .values({
          name: '',
          userAccountId: ctx.session.user.id,
          tenantId: input.tenantId,
        })
        .returning({
          id: consultationSession.id,
        })
        .execute();

      return newConsultation[0]!.id;
    }),

  endConsultation: protectedProcedure
    .input(endConsultationSchema)
    .mutation(async ({ input }) => {
      await db
        .update(consultationSession)
        .set({
          name: input.consultationName,
          endedAt: new Date(),
        })
        .where(eq(consultationSession.id, input.consultationId));

      const sessionMedias = Object.keys(input.viewedMedias).map((key) => {
        const mediaId = key as unknown as number;

        return {
          consultationSessionId: input.consultationId,
          mediaId,
          duration: input.viewedMedias[mediaId],
        };
      });

      await db.insert(consultationSessionMedia).values(sessionMedias);
    }),
});
