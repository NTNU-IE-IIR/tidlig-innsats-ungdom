/**
 * The core portion of the database schema, including authentication and tenancy.
 */
import { InferModel } from 'drizzle-orm';
import {
  AnyPgColumn,
  bigint,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

/**
 * Table for persisting application settings, such as if users can register.
 * This is meant to be generic enough to encapsulate any application setting as a JSON column.
 * Should not be used for settings that are user-specific.
 */
export const applicationSettings = pgTable('global_application_settings', {
  name: text('name').primaryKey(),
  value: jsonb('value').notNull(),
});

/**
 * The type of the application settings table.
 */
export type ApplicationSettings = InferModel<typeof applicationSettings>;

/**
 * Global user account roles.
 */
export enum UserAccountRole {
  GLOBAL_ADMIN = 'GLOBAL_ADMIN',
  USER = 'USER',
}

export const userAccountRole = pgEnum('user_account_role', [
  UserAccountRole.GLOBAL_ADMIN,
  UserAccountRole.USER,
]);

export const userAccount = pgTable(
  'user_account',
  {
    id: uuid('user_account_id').primaryKey().defaultRandom(),
    fullName: text('full_name').notNull(),
    email: text('email').notNull(),
    emailVerified: timestamp('email_verified', {
      withTimezone: true,
    }).defaultNow(),
    password: text('password').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    /**
     * The invitation that created this user account.
     */
    invitationId: uuid('fk_invitation_id').references(
      (): AnyPgColumn => invitation.id
    ),
    role: userAccountRole('role').notNull().default(UserAccountRole.USER),
  },
  (userAccount) => ({
    userAccountEmail: uniqueIndex('user_account_email_uq_idx').on(
      userAccount.email
    ),
  })
);

/**
 * Table for user account sessions.
 */
export const userAccountSession = pgTable(
  'user_account_session',
  {
    id: uuid('user_account_session_id').primaryKey().defaultRandom(),
    sessionToken: text('session_token').notNull(),
    userAccountId: uuid('fk_user_account_id')
      .notNull()
      .references(() => userAccount.id),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (userAccountSession) => ({
    userAccountSessionToken: uniqueIndex(
      'user_account_session_token_uq_idx'
    ).on(userAccountSession.sessionToken),
  })
);

export type UserAccountSession = InferModel<typeof userAccountSession>;

/**
 * Table for user account providers.
 * This is the accounts they have linked to their user account.
 */
export const providerAccount = pgTable(
  'provider_account',
  {
    id: uuid('provider_account_id').primaryKey().defaultRandom(),
    userAccountId: uuid('fk_user_account_id')
      .notNull()
      .references(() => userAccount.id),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    expiresAt: bigint('expires_at', { mode: 'number' }),
    tokenType: text('token_type'),
    scope: text('scope'),
    idToken: text('id_token'),
    sessionState: text('session_state'),
  },
  (providerAccount) => ({
    uniqueProviderAccount: uniqueIndex('provider_account_uq_idx').on(
      providerAccount.provider,
      providerAccount.providerAccountId
    ),
  })
);

export type ProviderAccount = InferModel<typeof providerAccount>;

export const tenant = pgTable('tenant', {
  id: uuid('tenant_id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type Tenant = InferModel<typeof tenant>;

/**
 * Join table between a tenant and a user account.
 * This is used to determine which user accounts have access to which tenants.
 */
export const tenantUserAccount = pgTable(
  'user_account_tenant',
  {
    tenantId: uuid('fk_tenant_id')
      .notNull()
      .references(() => tenant.id),
    userAccountId: uuid('fk_user_account_id').references(() => userAccount.id),
    /**
     * The invitation that created this tenant membership.
     */
    invitationId: uuid('fk_invitation_id').references(
      (): AnyPgColumn => invitation.id
    ),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    /**
     * The date this tenant membership was deleted/revoked.
     * If null, the tenant membership is active.
     */
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (tenantUserAccount) => ({
    uniqueTenantUserAccount: uniqueIndex('tenant_user_account_uq_idx').on(
      tenantUserAccount.tenantId,
      tenantUserAccount.userAccountId
    ),
  })
);

export const invitation = pgTable(
  'invitation',
  {
    id: uuid('invitation_id').primaryKey().defaultRandom(),
    comment: text('comment'),
    maxUses: integer('max_uses'),
    code: text('code').notNull(),
    tenantId: uuid('fk_tenant_id')
      .notNull()
      .references(() => tenant.id),
    createdBy: uuid('fk_created_by_account_id')
      .notNull()
      .references(() => userAccount.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (invitation) => ({
    uniqueInvitationCode: uniqueIndex('invitation_code_uq_idx').on(
      invitation.code
    ),
  })
);
