import { db } from '@/server/db';
import { UserAccountRole, userAccountSession } from '@/server/db/schema';
import { findByEmail } from '@/server/db/services/userAccount';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';
import { type GetServerSidePropsContext } from 'next';
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import DrizzleAdapter from './drizzleAdapter';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      fullName: string;
      email: string;
      role: UserAccountRole;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    fullName: string;
    email: string;
    role: UserAccountRole;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    jwt({ token, account }) {
      if (account) {
        token.id = account.userId;
      }
      return token;
    },
    session({ session, token, user }) {
      if (session.user) {
        session.user.id = token.sub ?? user.id;
      }
      return session;
    },
    async signIn({ user }) {
      await db.insert(userAccountSession).values({
        userAccountId: user.id,
        sessionToken: randomUUID(),
        expiresAt: dayjs().add(30, 'days').toDate(),
      });

      return true;
    },
  },
  session: {
    strategy: 'jwt',
  },
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const foundUser = await findByEmail(credentials.email);

        if (!foundUser) return null;

        const passwordMatches = await bcrypt.compare(
          credentials.password,
          foundUser.password
        );

        if (!passwordMatches) return null;

        return {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.fullName,
          fullName: foundUser.fullName,
          role: foundUser.role,
          image: '',
        };
      },
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
