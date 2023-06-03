CREATE TABLE IF NOT EXISTS "invitation" (
	"invitation_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment" text,
	"max_uses" integer,
	"code" text NOT NULL,
	"fk_tenant_id" uuid NOT NULL,
	"fk_created_by_account_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone NOT NULL
);

ALTER TABLE "user_account_tenant" ADD COLUMN "fk_invitation_id" uuid;
ALTER TABLE "user_account" ADD COLUMN "fk_invitation_id" uuid;
DO $$ BEGIN
 ALTER TABLE "user_account_tenant" ADD CONSTRAINT "user_account_tenant_fk_invitation_id_invitation_invitation_id_fk" FOREIGN KEY ("fk_invitation_id") REFERENCES "invitation"("invitation_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_account" ADD CONSTRAINT "user_account_fk_invitation_id_invitation_invitation_id_fk" FOREIGN KEY ("fk_invitation_id") REFERENCES "invitation"("invitation_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "invitation" ADD CONSTRAINT "invitation_fk_tenant_id_tenant_tenant_id_fk" FOREIGN KEY ("fk_tenant_id") REFERENCES "tenant"("tenant_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "invitation" ADD CONSTRAINT "invitation_fk_created_by_account_id_user_account_user_account_id_fk" FOREIGN KEY ("fk_created_by_account_id") REFERENCES "user_account"("user_account_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "invitation_code_uq_idx" ON "invitation" ("code");