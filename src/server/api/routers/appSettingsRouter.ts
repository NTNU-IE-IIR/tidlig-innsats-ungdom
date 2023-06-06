import { configureSchema } from '@/schemas/appSettingsSchemas';
import { db } from '@/server/db';
import {
  TenantRole,
  UserAccountRole,
  applicationSettings,
  tenant,
  tenantUserAccount,
} from '@/server/db/schema';
import { isUserRegistrationEnabled } from '@/server/db/services/appSettings';
import { hasRegisteredUserAccounts } from '@/server/db/services/userAccount';
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

      await db
        .insert(tenantUserAccount)
        .values({
          tenantId: createdTenant[0]!.id,
          userAccountId: ctx.session.user.id,
          role: TenantRole.OWNER,
        })
        .onConflictDoNothing();
    }),
  registrationEnabled: publicProcedure.query(async () => {
    return await isUserRegistrationEnabled();
  }),
});
