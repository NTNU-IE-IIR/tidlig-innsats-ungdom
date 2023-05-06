import { db } from '@/server/db';
import { providerAccount, userAccount, userAccountSession } from '@/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { Adapter } from 'next-auth/adapters';

const DrizzleAdapter = (client: typeof db): Adapter => ({
  async createUser(data) {
    return client
      .insert(userAccount)
      .values({
        email: data.email,
        password: '',
        fullName: data.fullName,
      })
      .returning()
      .then((res) => res[0]!);
  },

  async getUser(id) {
    return (
      client
        .select()
        .from(userAccount)
        .where(eq(userAccount.id, id))
        .then((res) => res[0]!) ?? null
    );
  },

  async getUserByEmail(email) {
    return (
      client
        .select()
        .from(userAccount)
        .where(eq(userAccount.email, email))
        .then((res) => res[0]!) ?? null
    );
  },

  async updateUser(user) {
    return (
      client
        .update(userAccount)
        .set({
          email: user.email,
          password: user.fullName,
          emailVerified: user.emailVerified,
          fullName: user.fullName,
        })
        .where(eq(userAccount.id, user.id))
        .returning()
        .then((res) => res[0]!) ?? null
    );
  },

  async getUserByAccount({ provider, providerAccountId }) {
    return (
      client
        .select({ userAccount: userAccount })
        .from(userAccount)
        .innerJoin(
          providerAccount,
          eq(userAccount.id, providerAccount.userAccountId)
        )
        .where(
          and(
            eq(providerAccount.provider, provider),
            eq(providerAccount.id, providerAccountId)
          )
        )
        .then((res) => res[0]!.userAccount) ?? null
    );
  },

  async linkAccount(account) {
    client.insert(providerAccount).values({
      userAccountId: account.userId,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      refreshToken: account.refresh_token,
      accessToken: account.access_token,
      expiresAt: account.expires_at,
      tokenType: account.token_type,
      scope: account.scope,
      idToken: account.id_token,
      sessionState: account.session_state,
    });
  },

  async createSession(session) {
    console.log('create session')
    return (
      client
        .insert(userAccountSession)
        .values({
          userAccountId: session.userId,
          sessionToken: session.sessionToken,
          expiresAt: session.expires,
        })
        .returning({
          sessionToken: userAccountSession.sessionToken,
          userId: userAccountSession.userAccountId,
          expires: userAccountSession.expiresAt,
        })
        .then((res) => res[0]!) ?? null
    );
  },

  async getSessionAndUser(sessionToken) {
    return (
      client
        .select({
          user: userAccount,
          session: {
            sessionToken: userAccountSession.sessionToken,
            userId: userAccountSession.userAccountId,
            expires: userAccountSession.expiresAt,
          },
        })
        .from(userAccountSession)
        .innerJoin(
          userAccount,
          eq(userAccountSession.userAccountId, userAccount.id)
        )
        .where(eq(userAccountSession.sessionToken, sessionToken))
        .then((res) => res[0]!) ?? null
    );
  },

  async updateSession(session) {
    return (
      client
        .update(userAccountSession)
        .set({
          expiresAt: session.expires,
        })
        .where(eq(userAccountSession.sessionToken, session.sessionToken))
        .returning({
          sessionToken: userAccountSession.sessionToken,
          userId: userAccountSession.userAccountId,
          expires: userAccountSession.expiresAt,
        })
        .then((res) => res[0]!) ?? null
    );
  },

  async deleteSession(sessionToken) {
    await client
      .delete(userAccountSession)
      .where(eq(userAccountSession.sessionToken, sessionToken));
  },
});

export default DrizzleAdapter;
