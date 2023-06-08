import {
  createMemberSchema,
  modifyTenantMembershipSchema,
} from '@/schemas/tenantSchemas';
import { db } from '@/server/db';
import {
  TenantRole,
  UserAccountRole,
  tenant,
  tenantUserAccount,
  userAccount,
} from '@/server/db/schema';
import { TRPCError } from '@trpc/server';
import { and, eq, ilike, isNotNull, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { userHasTenantRole } from '@/server/db/services/tenant';

export const tenantRouter = createTRPCRouter({
  /**
   * Lists tenants that the current user is a member of.
   */
  listMyTenants: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select({
        id: tenant.id,
        name: tenant.name,
        role: tenantUserAccount.role,
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
          role: tenantUserAccount.role,
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

  registerMember: protectedProcedure
    .input(createMemberSchema)
    .mutation(async ({ input, ctx }) => {
      const registeredUser = await db
        .insert(userAccount)
        .values({
          email: input.userAccount.email,
          fullName: input.userAccount.fullName,
          password: input.userAccount.password,
          createdAt: new Date(),
          role: UserAccountRole.USER,
        })
        .returning({
          id: userAccount.id,
        });

      const user = registeredUser[0]!;

      await db.insert(tenantUserAccount).values({
        tenantId: input.tenantId,
        userAccountId: user.id,
        role: input.role,
      });
    }),

  /**
   * Updates the role of a user in a tenant.
   * Only the owner of the tenant can do this.
   */
  updateRole: protectedProcedure
    .input(modifyTenantMembershipSchema)
    .mutation(async ({ input }) => {
      if (input.role === undefined) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'ROLE_REQUIRED',
        });
      }

      const isPermitted = await userHasTenantRole(
        input.tenantId,
        input.userId,
        TenantRole.OWNER
      );

      if (!isPermitted) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'NOT_PERMITTED',
        });
      }

      await db
        .update(tenantUserAccount)
        .set({
          role: input.role,
        })
        .where(
          and(
            eq(tenantUserAccount.tenantId, input.tenantId),
            eq(tenantUserAccount.userAccountId, input.userId)
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
