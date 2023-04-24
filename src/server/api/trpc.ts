import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { type Session } from 'next-auth';

import { getServerAuthSession } from '@/server/auth';

type CreateContextOptions = {
  session: Session | null;
};

const createInnerTRPCContext = ({ session }: CreateContextOptions) => {
  return {
    session,
  };
};

export const createTRPCContext = async ({
  req,
  res,
}: CreateNextContextOptions) => {
  // Get the session from the server using the getServerSession wrapper function
  const session = await getServerAuthSession({ req, res });

  return createInnerTRPCContext({
    session,
  });
};

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { UserAccountRole } from '@/db/schema';

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

/**
 * Public procedure, can be accessed by anyone.
 */
export const publicProcedure = t.procedure;

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Protected (authenticated) procedure. Can only be accessed by logged-in users.
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

/**
 * Reusable middleware that enforces users are logged in and have the specified role before running the procedure.
 */
const enforceUserInRole = (role: UserAccountRole) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    if (ctx.session.user.role !== role) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }

    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });

/**
 * Role-protected procedure.
 *
 * @param role the role to enforce for the procedure
 *
 * @returns a procedure that can only be accessed by users with the specified role
 */
export const roleProtectedProcedure = (role: UserAccountRole) =>
  t.procedure.use(enforceUserInRole(role));
