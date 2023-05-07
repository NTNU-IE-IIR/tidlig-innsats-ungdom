import { configureSchema } from '@/schemas/appSettingsSchemas';
import { db } from '@/server/db';
import {
  UserAccountRole,
  applicationSettings,
  tenant,
  tenantUserAccount,
} from '@/server/db/schema';
import { hasRegisteredUserAccounts } from '@/server/db/services/userAccount';
import { eq } from 'drizzle-orm';
import {
  createTRPCRouter,
  publicProcedure,
  roleProtectedProcedure,
} from '../trpc';

export const appSettingsRouter = createTRPCRouter({
  uninitialized: publicProcedure.query(async () => {
    const hasAdmin = await hasRegisteredUserAccounts({
      role: UserAccountRole.GLOBAL_ADMIN,
    });

    return !hasAdmin;
  }),
  /**
   * Procedure for configuring the application settings.
   */
  configure: roleProtectedProcedure(UserAccountRole.GLOBAL_ADMIN)
    .input(configureSchema)
    .mutation(async ({ input, ctx }) => {
      await db
        .insert(applicationSettings)
        .values({
          name: 'USER_REGISTRATION_ENABLED',
          value: input.registrationEnabled,
        })
        .onConflictDoUpdate({
          set: {
            value: input.registrationEnabled,
          },
          target: applicationSettings.name,
        });

      const createdTenant = await db
        .insert(tenant)
        .values({
          name: input.tenantName,
          id: input.tenantId,
        })
        .onConflictDoNothing()
        .returning();

      db.insert(tenantUserAccount)
        .values({
          tenantId: createdTenant[0]!.id,
          userAccountId: ctx.session.user.id,
        })
        .onConflictDoNothing();
    }),
  registrationEnabled: publicProcedure.query(async () => {
    const results = await db
      .select({ value: applicationSettings.value })
      .from(applicationSettings)
      .where(eq(applicationSettings.name, 'USER_REGISTRATION_ENABLED'))
      .limit(1);

    if (results.length === 0) return true;

    return results[0]?.value === true;
  }),
});
