CREATE TABLE IF NOT EXISTS "user_account_favorite_media" (
	"fk_user_account_id" uuid,
	"fk_media_id" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_account_favorite_theme" (
	"fk_user_account_id" uuid,
	"fk_theme_id" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "user_account_favorite_media" ADD CONSTRAINT "user_account_favorite_media_fk_user_account_id_user_account_user_account_id_fk" FOREIGN KEY ("fk_user_account_id") REFERENCES "user_account"("user_account_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_account_favorite_media" ADD CONSTRAINT "user_account_favorite_media_fk_media_id_media_media_id_fk" FOREIGN KEY ("fk_media_id") REFERENCES "media"("media_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_account_favorite_theme" ADD CONSTRAINT "user_account_favorite_theme_fk_user_account_id_user_account_user_account_id_fk" FOREIGN KEY ("fk_user_account_id") REFERENCES "user_account"("user_account_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_account_favorite_theme" ADD CONSTRAINT "user_account_favorite_theme_fk_theme_id_theme_theme_id_fk" FOREIGN KEY ("fk_theme_id") REFERENCES "theme"("theme_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
