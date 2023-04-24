import { db } from '@/db';
import { UserAccountRole, userAccount } from '@/db/schema';
import { findByEmail } from '@/db/services/userAccount';
import { registerUserAccountSchema } from '@/schemas/userAccountSchemas';
import bcrypt from 'bcrypt';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const userAccountRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerUserAccountSchema)
    .mutation(async ({ input }) => {
      if ((await findByEmail(input.email)) !== null) {
        throw new Error('Email address already registered');
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      await db.insert(userAccount).values({
        email: input.email,
        password: hashedPassword,
        fullName: input.fullName,
        role: UserAccountRole.ADMIN,
      });
    }),
});
