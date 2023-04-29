import { InferModel } from 'drizzle-orm';
import {
  AnyPgColumn,
  bigint,
  bigserial,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export enum UserAccountRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export const userAccountRole = pgEnum('user_account_role', [
  UserAccountRole.ADMIN,
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
    role: userAccountRole('role').notNull().default(UserAccountRole.USER),
  },
  (userAccount) => ({
    userAccountEmail: uniqueIndex('user_account_email_uq_idx').on(
      userAccount.email
    ),
  })
);

export type UserAccount = InferModel<typeof userAccount>;

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

export const theme = pgTable('theme', {
  id: bigserial('theme_id', { mode: 'number' }).primaryKey(),
  name: text('name').notNull(),
  parentId: bigint('fk_parent_theme_id', { mode: 'number' }).references(
    (): AnyPgColumn => theme.id
  ),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdBy: uuid('fk_created_by_account_id')
    .notNull()
    .references(() => userAccount.id),
});

export type Theme = InferModel<typeof theme>;

export enum MediaType {
  FORM = 'FORM',
  RICH_TEXT = 'RICH_TEXT',
}

export const mediaType = pgEnum('media_type', [
  MediaType.FORM,
  MediaType.RICH_TEXT,
]);

export const media = pgTable('media', {
  id: bigserial('media_id', { mode: 'number' }).primaryKey(),
  content: jsonb('content').notNull(),
  createdBy: uuid('fk_created_by_account_id')
    .notNull()
    .references(() => userAccount.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  type: mediaType('media_type').notNull(),
});

export type Media = InferModel<typeof media>;

export const themeMedia = pgTable(
  'theme_media',
  {
    themeId: bigint('fk_theme_id', { mode: 'number' }).references(
      () => theme.id
    ),
    mediaId: bigint('fk_media_id', { mode: 'number' }).references(
      () => media.id
    ),
  },
  (themeMedia) => ({
    themeMediaPkey: primaryKey(themeMedia.themeId, themeMedia.mediaId),
  })
);

export type ThemeMedia = InferModel<typeof themeMedia>;

/**
 * Table for persisting application settings, such as if users can register.
 */
export const applicationSettings = pgTable('global_application_settings', {
  name: text('name').primaryKey(),
  value: jsonb('value').notNull(),
});

export type ApplicationSettings = InferModel<typeof applicationSettings>;
