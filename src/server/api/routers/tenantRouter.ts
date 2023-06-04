import { db } from '@/server/db';
import { tenant, tenantUserAccount, userAccount } from '@/server/db/schema';
import { and, eq, ilike } from 'drizzle-orm';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

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
            ilike(userAccount.fullName, `%${input.name ?? ''}%`)
          )
        );
    }),
});
