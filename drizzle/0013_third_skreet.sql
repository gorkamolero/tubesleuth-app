CREATE TABLE IF NOT EXISTS "user_invitations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"accepted" boolean DEFAULT false,
	"user_id" uuid
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_invitations" ADD CONSTRAINT "user_invitations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
