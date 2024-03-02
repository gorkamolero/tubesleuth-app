ALTER TABLE "images" ADD COLUMN "video_id" uuid;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "src" text;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "generations" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "images" ADD CONSTRAINT "images_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
