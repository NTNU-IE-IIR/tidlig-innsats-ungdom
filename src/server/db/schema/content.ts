/**
 * The content part of the schema, oriented around themes and media defined by users.
 */
import {
  AnyPgColumn,
  bigint,
  bigserial,
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { userAccount } from './core';

export const theme = pgTable('theme', {
  id: bigserial('theme_id', { mode: 'number' }).primaryKey(),
  name: text('name').notNull(),
  shortDescription: text('short_description').notNull().default(''),
  iconUrl: text('icon_url'),
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

export type Theme = typeof theme.$inferSelect;

export enum MediaType {
  FORM = 'FORM',
  RICH_TEXT = 'RICH_TEXT',
  FILE = 'FILE',
}

export const mediaType = pgEnum('media_type', [
  MediaType.FORM,
  MediaType.RICH_TEXT,
  MediaType.FILE,
]);

export interface FormMedia {
  questions: any[];
}

export interface RichTextMedia {
  root: any;
}

export interface FileMedia {
  tenantId: string;
  fileId: string;
}

export type MediaContent = FormMedia | RichTextMedia | FileMedia;

export const media = pgTable('media', {
  id: bigserial('media_id', { mode: 'number' }).primaryKey(),
  name: text('name').notNull(),
  shortDescription: text('short_description').notNull().default(''),
  content: jsonb('content').$type<MediaContent>(),
  published: boolean('published').notNull().default(false),
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

export type Media = typeof media.$inferSelect;

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

export type ThemeMedia = typeof themeMedia.$inferSelect;

export const userAccountFavoriteTheme = pgTable('user_account_favorite_theme', {
  userAccountId: uuid('fk_user_account_id').references(() => userAccount.id),
  themeId: bigint('fk_theme_id', { mode: 'number' }).references(() => theme.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type UserAccountFavoriteTheme =
  typeof userAccountFavoriteTheme.$inferSelect;

export const userAccountFavoriteMedia = pgTable('user_account_favorite_media', {
  userAccountId: uuid('fk_user_account_id').references(() => userAccount.id),
  mediaId: bigint('fk_media_id', { mode: 'number' }).references(() => media.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type UserAccountFavoriteMedia =
  typeof userAccountFavoriteMedia.$inferSelect;

export const mediaView = pgTable(
  'media_view',
  {
    id: bigserial('media_view_id', { mode: 'number' }).primaryKey(),
    mediaId: bigint('fk_media_id', { mode: 'number' }).references(
      () => media.id
    ),
    userAccountId: uuid('fk_user_account_id').references(() => userAccount.id),
    viewedAt: timestamp('viewed_at', { withTimezone: true }).defaultNow(),
  },
  (mediaView) => ({
    mediaIdIdx: index('fk_media_id_idx').on(mediaView.mediaId),
    userAccountIdIdx: index('fk_user_account_id_idx').on(
      mediaView.userAccountId
    ),
  })
);
