import {
  registerUserAccountSchema,
  updateUserAccountSchema,
} from '@/schemas/userAccountSchemas';
import { db } from '@/server/db';
import {
  UserAccountRole,
  tenantUserAccount,
  userAccount,
} from '@/server/db/schema';
import { isUserRegistrationEnabled } from '@/server/db/services/appSettings';
import { findNonExpiredInvitationByCode } from '@/server/db/services/invitation';
import {
  findById,
  hasRegisteredUserAccounts,
} from '@/server/db/services/userAccount';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { eq, sql } from 'drizzle-orm';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  roleProtectedProcedure,
} from '../trpc';

export const userAccountRouter = createTRPCRouter({
  listContacts: publicProcedure.query(async () => {
    const results = await db
      .select({
        fullName: userAccount.fullName,
        email: userAccount.email,
      })
      .from(userAccount)
      .where(eq(userAccount.role, UserAccountRole.GLOBAL_ADMIN));

    return results;
  }),

  listUsers: roleProtectedProcedure(UserAccountRole.GLOBAL_ADMIN).query(
    async () => {
      const results = await db
        .select({
          id: userAccount.id,
          fullName: userAccount.fullName,
          email: userAccount.email,
          role: userAccount.role,
          createdAt: userAccount.createdAt,
          tenants: sql<number>`COUNT(DISTINCT ${tenantUserAccount.tenantId})`,
        })
        .from(userAccount)
        .leftJoin(
          tenantUserAccount,
          eq(tenantUserAccount.userAccountId, userAccount.id)
        )
        .groupBy(userAccount.id);

      return results;
    }
  ),

  register: publicProcedure
    .input(registerUserAccountSchema)
    .mutation(async ({ input }) => {
      if (await hasRegisteredUserAccounts({ email: input.email })) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Email address already registered',
        });
      }

      if (!input.inviteCode && !(await isUserRegistrationEnabled())) {
        throw new TRPCError({
          code: 'FORBIDDEN',
        });
      }

      let invitationId: string | null = null;
      let tenantId: string | null = null;

      if (input.inviteCode) {
        const results = await findNonExpiredInvitationByCode(input.inviteCode);

        if (results.length !== 1) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'INVALID_INVITE_CODE',
          });
        }

        const invite = results[0]!;

        if (invite.maxUses && invite.uses >= invite.maxUses) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'INVITATION_MAX_USES_REACHED',
          });
        }

        invitationId = invite.id;
        tenantId = invite.tenantId;
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const hasAdmin = await hasRegisteredUserAccounts({
        role: UserAccountRole.GLOBAL_ADMIN,
      });

      // the first user to register is given administrative privileges globally.
      const role = hasAdmin
        ? UserAccountRole.USER
        : UserAccountRole.GLOBAL_ADMIN;

      const result = await db
        .insert(userAccount)
        .values({
          email: input.email,
          password: hashedPassword,
          fullName: input.fullName,
          role,
          invitationId,
        })
        .returning({
          id: userAccount.id,
          role: userAccount.role,
        });

      const registeredUser = result[0]!;

      if (invitationId && tenantId) {
        await db.insert(tenantUserAccount).values({
          tenantId,
          invitationId,
          userAccountId: registeredUser.id,
        });
      }

      return registeredUser;
    }),

  /**
   * Updates a user account.
   * Users are allowed to update their own account, but administrators are allowed to update other users as well.
   */
  updateUserAccount: protectedProcedure
    .input(updateUserAccountSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await findById(input.id ?? ctx.session.user.id);

      if (!user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'USER_NOT_FOUND',
        });
      }

      if (
        user?.id !== ctx.session.user.id &&
        ctx.session.user.role !== UserAccountRole.GLOBAL_ADMIN
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      // if the user is updating themselves - we enforce the presence of a current password
      if (user?.id === ctx.session.user.id) {
        const isPasswordValid = await bcrypt.compare(
          input.currentPassword,
          user.password
        );

        if (!isPasswordValid) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'INVALID_PASSWORD',
          });
        }
      }

      let password: string | undefined;

      if (input.newPassword !== undefined) {
        password = await bcrypt.hash(input.newPassword, 10);
      }

      const result = await db
        .update(userAccount)
        .set({
          fullName: input.fullName,
          email: input.email,
          password,
        })
        .where(eq(userAccount.id, user.id))
        .returning({
          fullName: userAccount.fullName,
          email: userAccount.email,
        });

      return result[0]!;
    }),
});
