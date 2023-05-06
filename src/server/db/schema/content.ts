/**
 * The content part of the schema, oriented around themes and media defined by users.
 */
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
  uuid,
} from 'drizzle-orm/pg-core';
import { userAccount } from './core';

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
