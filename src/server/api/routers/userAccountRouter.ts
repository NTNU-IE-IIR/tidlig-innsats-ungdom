import { registerUserAccountSchema } from '@/schemas/userAccountSchemas';
import { db } from '@/server/db';
import { UserAccountRole, userAccount } from '@/server/db/schema';
import { hasRegisteredUserAccounts } from '@/server/db/services/userAccount';
import bcrypt from 'bcrypt';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { isUserRegistrationEnabled } from '@/server/db/services/appSettings';
import { TRPCError } from '@trpc/server';

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

      if (!(await isUserRegistrationEnabled())) {
        throw new TRPCError({
          code: 'FORBIDDEN',
        });
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
        })
        .returning({
          id: userAccount.id,
          role: userAccount.role,
        });

      return result[0]!;
    }),
});
