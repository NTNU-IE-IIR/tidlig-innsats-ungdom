DO $$ BEGIN
 CREATE TYPE "media_type" AS ENUM('FORM', 'RICH_TEXT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "user_account_role" AS ENUM('ADMIN', 'USER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "media" (
	"media_id" bigserial PRIMARY KEY NOT NULL,
	"content" jsonb NOT NULL,
	"fk_created_by_account_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"media_type" media_type NOT NULL
);

CREATE TABLE IF NOT EXISTS "provider_account" (
	"provider_account_id" text NOT NULL,
	"fk_user_account_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" bigint,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);

CREATE TABLE IF NOT EXISTS "theme" (
	"theme_id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"fk_created_by_account_id" uuid NOT NULL
);

CREATE TABLE IF NOT EXISTS "theme_child" (
	"fk_parent_theme_id" bigint,
	"fk_child_theme_id" bigint
);
ALTER TABLE "theme_child" ADD CONSTRAINT "theme_child_fk_child_theme_id_fk_parent_theme_id" PRIMARY KEY("fk_child_theme_id","fk_parent_theme_id");

CREATE TABLE IF NOT EXISTS "theme_media" (
	"fk_theme_id" bigint,
	"fk_media_id" bigint
);
ALTER TABLE "theme_media" ADD CONSTRAINT "theme_media_fk_theme_id_fk_media_id" PRIMARY KEY("fk_theme_id","fk_media_id");

CREATE TABLE IF NOT EXISTS "user_account" (
	"user_account_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" timestamp with time zone DEFAULT now(),
	"password" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"role" user_account_role DEFAULT 'USER' NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_account_session" (
	"user_account_session_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_token" text NOT NULL,
	"fk_user_account_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "media" ADD CONSTRAINT "media_fk_created_by_account_id_user_account_user_account_id_fk" FOREIGN KEY ("fk_created_by_account_id") REFERENCES "user_account"("user_account_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "provider_account" ADD CONSTRAINT "provider_account_fk_user_account_id_user_account_user_account_id_fk" FOREIGN KEY ("fk_user_account_id") REFERENCES "user_account"("user_account_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "theme" ADD CONSTRAINT "theme_fk_created_by_account_id_user_account_user_account_id_fk" FOREIGN KEY ("fk_created_by_account_id") REFERENCES "user_account"("user_account_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "theme_child" ADD CONSTRAINT "theme_child_fk_parent_theme_id_theme_theme_id_fk" FOREIGN KEY ("fk_parent_theme_id") REFERENCES "theme"("theme_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "theme_child" ADD CONSTRAINT "theme_child_fk_child_theme_id_theme_theme_id_fk" FOREIGN KEY ("fk_child_theme_id") REFERENCES "theme"("theme_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "theme_media" ADD CONSTRAINT "theme_media_fk_theme_id_theme_theme_id_fk" FOREIGN KEY ("fk_theme_id") REFERENCES "theme"("theme_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "theme_media" ADD CONSTRAINT "theme_media_fk_media_id_media_media_id_fk" FOREIGN KEY ("fk_media_id") REFERENCES "media"("media_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_account_session" ADD CONSTRAINT "user_account_session_fk_user_account_id_user_account_user_account_id_fk" FOREIGN KEY ("fk_user_account_id") REFERENCES "user_account"("user_account_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "provider_account_uq_idx" ON "provider_account" ("provider","provider_account_id");
CREATE UNIQUE INDEX IF NOT EXISTS "user_account_email_uq_idx" ON "user_account" ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "user_account_session_token_uq_idx" ON "user_account_session" ("session_token");