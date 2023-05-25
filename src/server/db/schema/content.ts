/**
 * The content part of the schema, oriented around themes and media defined by users.
 */
import { InferModel } from 'drizzle-orm';
import {
  AnyPgColumn,
  bigint,
  bigserial,
  boolean,
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
  name: text('name').notNull(),
  shortDescription: text('short_description').notNull().default(''),
  // TODO: Give this a type using .$type<>() and preferably a zod schema
  // the direction this'll take is dependant on the result of a discussion with the user
  content: jsonb('content').notNull(),
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
