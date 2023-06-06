import { db } from '@/server/db';
import { tenant, tenantUserAccount, userAccount } from '@/server/db/schema';
import { and, eq, ilike, isNotNull, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { modifyTenantMembershipSchema } from '@/schemas/tenantSchemas';

export const tenantRouter = createTRPCRouter({
  /**
   * Lists tenants that the current user is a member of.
   */
  listMyTenants: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select({
        id: tenant.id,
        name: tenant.name,
      })
      .from(tenantUserAccount)
      .innerJoin(tenant, eq(tenantUserAccount.tenantId, tenant.id))
      .where(eq(tenantUserAccount.userAccountId, ctx.session.user.id));
  }),

  /**
   * Lists the members of a specific tenant.
   */
  listMembers: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().uuid(),
        name: z.string().optional(),
        deleted: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      return await db
        .select({
          id: userAccount.id,
          fullName: userAccount.fullName,
          email: userAccount.email,
          createdAt: tenantUserAccount.createdAt,
        })
        .from(tenantUserAccount)
        .innerJoin(
          userAccount,
          eq(tenantUserAccount.userAccountId, userAccount.id)
        )
        .where(
          and(
            eq(tenantUserAccount.tenantId, input.tenantId),
            ilike(userAccount.fullName, `%${input.name ?? ''}%`),
            input.deleted
              ? isNotNull(tenantUserAccount.deletedAt)
              : isNull(tenantUserAccount.deletedAt)
          )
        );
    }),

  /**
   * Revokes the membership of a user from a tenant.
   */
  revokeMembership: protectedProcedure
    .input(modifyTenantMembershipSchema)
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'CANNOT_REVOKE_SELF',
        });
      }

      await db
        .update(tenantUserAccount)
        .set({
          deletedAt: new Date(),
        })
        .where(
          and(
            eq(tenantUserAccount.tenantId, input.tenantId),
            eq(tenantUserAccount.userAccountId, input.userId)
          )
        );
    }),

  /**
   * Restores the tenant access of a user.
   */
  restoreAccess: protectedProcedure
    .input(modifyTenantMembershipSchema)
    .mutation(async ({ input }) => {
      await db
        .update(tenantUserAccount)
        .set({
          deletedAt: null,
        })
        .where(
          and(
            eq(tenantUserAccount.tenantId, input.tenantId),
            eq(tenantUserAccount.userAccountId, input.userId)
          )
        );
    }),
});
