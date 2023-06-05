import { registerUserAccountSchema } from '@/schemas/userAccountSchemas';
import { db } from '@/server/db';
import {
  UserAccountRole,
  tenantUserAccount,
  userAccount,
} from '@/server/db/schema';
import { hasRegisteredUserAccounts } from '@/server/db/services/userAccount';
import bcrypt from 'bcrypt';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { isUserRegistrationEnabled } from '@/server/db/services/appSettings';
import { TRPCError } from '@trpc/server';
import { findNonExpiredInvitationByCode } from '@/server/db/services/invitation';

export const userAccountRouter = createTRPCRouter({
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
});
