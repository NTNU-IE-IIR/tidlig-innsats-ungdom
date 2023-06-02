import { createInvitationSchema } from '@/schemas/invitationSchemas';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { db } from '@/server/db';
import { invitation, tenant, userAccount } from '@/server/db/schema';
import dayjs from 'dayjs';
import { randomBytes } from 'crypto';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';

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
   * Creates an invitation code for a tenant.
   */
  // TODO: Require the user to be an 'ADMIN' of the tenant.
  createInvite: protectedProcedure
    .input(createInvitationSchema)
    .mutation(async ({ input, ctx }) => {
      let code: string | null = null;

      randomBytes(48, (err, buf) => {
        if (!err) code = buf.toString('base64');
      });

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
});
