ALTER TABLE "user_invitations" RENAME TO "invitations";--> statement-breakpoint
ALTER TABLE "invitations" DROP CONSTRAINT "user_invitations_user_id_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invitations" ADD CONSTRAINT "invitations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
