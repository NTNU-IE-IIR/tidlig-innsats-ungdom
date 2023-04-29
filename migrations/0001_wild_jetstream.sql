DROP TABLE theme_child;
ALTER TABLE "theme" ADD COLUMN "fk_parent_theme_id" bigint;
DO $$ BEGIN
 ALTER TABLE "theme" ADD CONSTRAINT "theme_fk_parent_theme_id_theme_theme_id_fk" FOREIGN KEY ("fk_parent_theme_id") REFERENCES "theme"("theme_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
