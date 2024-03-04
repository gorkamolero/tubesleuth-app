ALTER TYPE "fx" ADD VALUE 'MoveAbout';--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "ready_to_render" boolean DEFAULT false;