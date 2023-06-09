import {
  bigserial,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { media } from './content';
import { tenant, userAccount } from './core';
import { InferModel } from 'drizzle-orm';

export const consultationSession = pgTable('consultation_session', {
  id: bigserial('consultation_session_id', { mode: 'number' }).primaryKey(),
  name: text('name').notNull(),
  notes: text('notes').notNull().default(''),
  startedAt: timestamp('started_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  userAccountId: uuid('fk_user_account_id')
    .notNull()
    .references(() => userAccount.id),
  tenantId: uuid('fk_tenant_id')
    .notNull()
    .references(() => tenant.id),
});

export type ConsultationSession = InferModel<typeof consultationSession>;

export type ConsultationSessionEntry = [Date, Date];

export const consultationSessionMedia = pgTable('consultation_session_media', {
  consultationSessionId: uuid('fk_consultation_session_id')
    .notNull()
    .references(() => consultationSession.id),
  mediaId: uuid('fk_media_id')
    .notNull()
    .references(() => media.id),
  timestamps: jsonb('timestamps').$type<ConsultationSessionEntry[]>(),
});

export type ConsultationSessionMedia = InferModel<
  typeof consultationSessionMedia
>;
