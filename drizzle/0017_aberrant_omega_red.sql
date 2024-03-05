ALTER TYPE "fx" ADD VALUE 'horizontal';--> statement-breakpoint
ALTER TYPE "fx" ADD VALUE 'vertical';--> statement-breakpoint
ALTER TYPE "fx" ADD VALUE 'circle';--> statement-breakpoint
ALTER TYPE "fx" ADD VALUE 'perspective';--> statement-breakpoint
ALTER TYPE "fx" ADD VALUE 'zoom';--> statement-breakpoint
DROP TABLE "image_maps";--> statement-breakpoint
ALTER TABLE "images" RENAME COLUMN "MoveAround" TO "fx";