CREATE TABLE IF NOT EXISTS "media_view" (
	"media_view_id" bigserial PRIMARY KEY NOT NULL,
	"fk_media_id" bigint,
	"fk_user_account_id" uuid,
	"viewed_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fk_media_id_idx" ON "media_view" ("fk_media_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fk_user_account_id_idx" ON "media_view" ("fk_user_account_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media_view" ADD CONSTRAINT "media_view_fk_media_id_media_media_id_fk" FOREIGN KEY ("fk_media_id") REFERENCES "media"("media_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media_view" ADD CONSTRAINT "media_view_fk_user_account_id_user_account_user_account_id_fk" FOREIGN KEY ("fk_user_account_id") REFERENCES "user_account"("user_account_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
