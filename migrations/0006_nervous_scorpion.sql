DO $$ BEGIN
 CREATE TYPE "tenant_role" AS ENUM('OWNER', 'SUPER_USER', 'USER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "user_account_tenant" ADD COLUMN "role" "tenant_role" DEFAULT 'USER' NOT NULL;