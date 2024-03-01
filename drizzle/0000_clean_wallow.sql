DO $$ BEGIN
 CREATE TYPE "fx" AS ENUM('ZoomIn', 'ZoomOut', 'PanLeft', 'PanRight', 'PanUp', 'PanDown', 'MoveAround');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "transition" AS ENUM('Fade', 'SlideLeft', 'SlideRight', 'SlideUp', 'SlideDown');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "video_type" AS ENUM('Video', 'Short');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "voicemodel" AS ENUM('onyx', 'nova', 'shimmer', 'echo', 'fable', 'alloy');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channels" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text,
	"cta" text,
	"writing_style" text,
	"onyx" "voicemodel",
	"image_style" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "image_maps" (
	"id" uuid PRIMARY KEY NOT NULL,
	"image_id" uuid,
	"start" integer,
	"end" integer,
	"video_id" uuid,
	"MoveAround" "fx",
	"Fade" "transition"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "images" (
	"id" uuid PRIMARY KEY NOT NULL,
	"description" text,
	"prompt" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text,
	"body" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "videos" (
	"id" uuid PRIMARY KEY NOT NULL,
	"input" text,
	"title" text,
	"description" text,
	"tags" text,
	"script" text,
	"voiceover" text,
	"uploaded" boolean DEFAULT false,
	"videofile" text,
	"notes" text,
	"channel_id" uuid,
	"user_id" uuid,
	"short" "video_type",
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channels" ADD CONSTRAINT "channels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "image_maps" ADD CONSTRAINT "image_maps_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "images"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "image_maps" ADD CONSTRAINT "image_maps_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "videos" ADD CONSTRAINT "videos_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "videos" ADD CONSTRAINT "videos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
