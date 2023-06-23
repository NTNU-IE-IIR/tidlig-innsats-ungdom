CREATE TABLE IF NOT EXISTS "consultation_patient" (
	"consultation_patient_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discriminator" text NOT NULL,
	"fk_consulted_by_id" uuid,
	"fk_tenant_id" uuid NOT NULL
);

CREATE TABLE IF NOT EXISTS "consultation_session" (
	"consultation_session_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"fk_user_account_id" uuid NOT NULL,
	"fk_tenant_id" uuid NOT NULL
);

CREATE TABLE IF NOT EXISTS "consultation_session_media" (
	"fk_consultation_session_id" uuid NOT NULL,
	"fk_media_id" bigint NOT NULL,
	"duration_seconds" integer
);

DO $$ BEGIN
 ALTER TABLE "consultation_patient" ADD CONSTRAINT "consultation_patient_fk_consulted_by_id_user_account_user_account_id_fk" FOREIGN KEY ("fk_consulted_by_id") REFERENCES "user_account"("user_account_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "consultation_patient" ADD CONSTRAINT "consultation_patient_fk_tenant_id_tenant_tenant_id_fk" FOREIGN KEY ("fk_tenant_id") REFERENCES "tenant"("tenant_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "consultation_session" ADD CONSTRAINT "consultation_session_fk_user_account_id_user_account_user_account_id_fk" FOREIGN KEY ("fk_user_account_id") REFERENCES "user_account"("user_account_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "consultation_session" ADD CONSTRAINT "consultation_session_fk_tenant_id_tenant_tenant_id_fk" FOREIGN KEY ("fk_tenant_id") REFERENCES "tenant"("tenant_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "consultation_session_media" ADD CONSTRAINT "consultation_session_media_fk_consultation_session_id_consultation_session_consultation_session_id_fk" FOREIGN KEY ("fk_consultation_session_id") REFERENCES "consultation_session"("consultation_session_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "consultation_session_media" ADD CONSTRAINT "consultation_session_media_fk_media_id_media_media_id_fk" FOREIGN KEY ("fk_media_id") REFERENCES "media"("media_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
