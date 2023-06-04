import { createInvitationSchema } from '@/schemas/invitationSchemas';
import { db } from '@/server/db';
import {
  invitation,
  tenant,
  tenantUserAccount,
  userAccount,
} from '@/server/db/schema';
import { TRPCError } from '@trpc/server';
import { randomBytes } from 'crypto';
import dayjs from 'dayjs';
import { and, eq, gt, lt, sql } from 'drizzle-orm';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const invitationRouter = createTRPCRouter({
  /**
   * Gets an invitation by its code.
   * This is a public procedure, allowing anyone to use it.
   */
  getInvite: publicProcedure.input(z.string()).query(async ({ input }) => {
    const invites = await db
      .select({
        tenantName: tenant.name,
        inviteeName: userAccount.fullName,
      })
      .from(invitation)
      .innerJoin(tenant, eq(invitation.tenantId, tenant.id))
      .innerJoin(userAccount, eq(invitation.createdBy, userAccount.id))
      .where(eq(invitation.code, input));

    if (invites.length !== 1) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'INVITATION_NOT_FOUND',
      });
    }

    return invites[0];
  }),

  /**
   * Lists all invitations for a tenant.
   */
  listInvites: protectedProcedure
    .input(
      z.object({
        expired: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      return await db
        .select({
          id: invitation.id,
          code: invitation.code,
          comment: invitation.comment,
          maxUses: invitation.maxUses,
          creator: userAccount.fullName,
          createdAt: invitation.createdAt,
          expiresAt: invitation.expiresAt,
          invitedUsers: sql<number>`COUNT(DISTINCT ${tenantUserAccount.userAccountId})`,
        })
        .from(invitation)
        .innerJoin(userAccount, eq(invitation.createdBy, userAccount.id))
        .leftJoin(
          tenantUserAccount,
          eq(invitation.id, tenantUserAccount.invitationId)
        )
        .where(
          and(
            input.expired
              ? lt(invitation.expiresAt, dayjs().toDate())
              : gt(invitation.expiresAt, dayjs().toDate())
          )
        )
        .groupBy(invitation.id, userAccount.id);
    }),

  /**
   * Creates an invitation code for a tenant.
   */
  // TODO: Require the user to be an 'ADMIN' of the tenant.
  createInvite: protectedProcedure
    .input(createInvitationSchema)
    .mutation(async ({ input, ctx }) => {
      let code: string | null = null;

      await new Promise((resolve) =>
        randomBytes(48, (err, buf) => {
          if (!err) code = buf.toString('base64');
          resolve(null);
        })
      );

      if (!code) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'INVITATION_CODE_GENERATION_FAILED',
        });
      }

      try {
        const expiresAt = dayjs().add(7, 'day').toDate();

        await db.insert(invitation).values({
          tenantId: input.tenantId,
          comment: input.comment,
          maxUses: input.maxUses,
          code,
          createdBy: ctx.session?.user?.id,
          expiresAt,
        });

        return {
          code,
          expiresAt,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'INVITATION_CREATION_FAILED',
        });
      }
    }),

  /**
   * Expires an invitation code.
   */
  expireInvite: protectedProcedure
    .input(z.string())
    .mutation(async ({ input: id }) => {
      const results = await db
        .select({
          expiresAt: invitation.expiresAt,
        })
        .from(invitation)
        .where(eq(invitation.id, id));

      if (results.length !== 1) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'INVITATION_NOT_FOUND',
        });
      }

      if (dayjs().isAfter(results[0]!.expiresAt)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'INVITATION_ALREADY_EXPIRED',
        });
      }

      await db
        .update(invitation)
        .set({
          expiresAt: dayjs().toDate(),
        })
        .where(eq(invitation.id, id));
    }),
});
