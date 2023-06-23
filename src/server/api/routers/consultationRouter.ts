import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { db } from '@/server/db';
import { consultationSession } from '@/server/db/schema';
import { and, eq, isNotNull } from 'drizzle-orm';

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
        .where(and(eq(consultationSession.userAccountId, ctx.session.user.id)))
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
    .input(z.object({ consultationId: z.string() }))
    .mutation(async ({ input }) => {
      await db
        .update(consultationSession)
        .set({
          endedAt: new Date(),
        })
        .where(eq(consultationSession.id, input.consultationId))
        .execute();
    }),
});
