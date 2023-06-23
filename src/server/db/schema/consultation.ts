import { InferModel } from 'drizzle-orm';
import {
  bigint,
  bigserial,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { media } from './content';
import { tenant, userAccount } from './core';

export const consultationSession = pgTable('consultation_session', {
  id: uuid('consultation_session_id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  /**
   * User notes about the consultation session.
   */
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

export const consultationSessionMedia = pgTable('consultation_session_media', {
  consultationSessionId: uuid('fk_consultation_session_id')
    .notNull()
    .references(() => consultationSession.id),
  mediaId: bigint('fk_media_id', { mode: 'number' })
    .notNull()
    .references(() => media.id),
  /**
   * The duration of the media being open in seconds.
   */
  duration: integer('duration_seconds'),
});

export type ConsultationSessionMedia = InferModel<
  typeof consultationSessionMedia
>;

export const consultationPatient = pgTable('consultation_patient', {
  id: uuid('consultation_patient_id').primaryKey().defaultRandom(),
  /**
   * A code or identifier for the patient.
   */
  discriminator: text('discriminator').notNull(),
  /**
   * A reference to the consultant/doctor that created this patient.
   * This is used to only show the patients that the consultant/doctor has created.
   */
  consultedById: uuid('fk_consulted_by_id').references(() => userAccount.id),
  /**
   * The tenant in which the patient was created.
   */
  tenantId: uuid('fk_tenant_id')
    .notNull()
    .references(() => tenant.id),
});
