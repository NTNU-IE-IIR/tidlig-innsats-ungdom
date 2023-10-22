import {
  saveConsultationSchema,
  updateConsultationSchema,
} from '@/schemas/consultationSchemas';
import { db } from '@/server/db';
import {
  consultationSession,
  consultationSessionMedia,
} from '@/server/db/schema';
import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import { and, eq, isNotNull } from 'drizzle-orm';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const consultationRouter = createTRPCRouter({
  getConsultation: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      const result = db.query.consultationSession.findFirst({
        with: {
          viewedMedias: {
            columns: {
              duration: true,
              mediaId: true,
            },
            with: {
              media: {
                columns: {
                  name: true,
                },
                with: {
                  themes: {
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
              },
            },
          },
        },
        where: eq(consultationSession.id, input),
      });

      return result;
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
        )
        .orderBy(consultationSession.startedAt);
    }),

  saveConsultation: protectedProcedure
    .input(saveConsultationSchema)
    .mutation(async ({ input, ctx }) => {
      const savedSession = await db
        .insert(consultationSession)
        .values({
          name: input.consultationName,
          tenantId: input.tenantId,
          userAccountId: ctx.session.user.id,
          notes: input.notes,
          startedAt: dayjs(input.startedAt).toDate(),
          endedAt: new Date(),
        })
        .returning({
          id: consultationSession.id,
        });

      if (savedSession.length !== 1) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Failed to save consultation',
        });
      }

      const sessionMedias = Object.keys(input.viewedMedias).map((key) => {
        const mediaId = key as unknown as number;

        return {
          consultationSessionId: savedSession[0]!.id,
          mediaId,
          duration: input.viewedMedias[mediaId],
        };
      });

      if (sessionMedias.length !== 0) {
        await db.insert(consultationSessionMedia).values(sessionMedias);
      }

      return {
        status: 'OK',
      };
    }),

  updateConsultation: protectedProcedure
    .input(updateConsultationSchema)
    .mutation(async ({ input, ctx }) => {
      await db
        .update(consultationSession)
        .set({
          name: input.consultationName,
          notes: input.notes,
        })
        .where(
          and(
            eq(consultationSession.id, input.consultationId),
            eq(consultationSession.userAccountId, ctx.session.user.id)
          )
        );

      return {
        status: 'OK',
      };
    }),

  deleteConsultation: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      const existing = await db
        .select({ id: consultationSession.id })
        .from(consultationSession)
        .where(eq(consultationSession.id, input));

      if (existing.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'CONSULTATION_NOT_FOUND',
        });
      }

      await db
        .delete(consultationSessionMedia)
        .where(eq(consultationSessionMedia.consultationSessionId, input));
      await db
        .delete(consultationSession)
        .where(eq(consultationSession.id, input));

      return {
        status: 'OK',
      };
    }),
});
