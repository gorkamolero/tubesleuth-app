import { db } from "~/database";
import { videos } from "~/database/schema";
import { getChannel } from "../channel";
import { json } from "@remix-run/node";
import { askAssistant } from "~/utils/openai";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { uuid } from "uuidv4";

export const videoSchema = createInsertSchema(videos);
export type vidSchema = z.infer<typeof videoSchema>;

export const createVideoSchema = videoSchema.pick({
	userId: true,
	channelId: true,
	ideaId: true,
	title: true,
	description: true,
	script: true,
	tags: true,
});

// Function to create a new channel
export async function createVideo({
	userId,
	channelId,
	ideaId,
	title,
	description,
	script,
	tags,
}: z.infer<typeof createVideoSchema>) {
	const id = uuid();
	const video = videoSchema.parse({
		id,
		title,
		description,
		tags,
		script,
		uploaded: false,
		voiceover: "",
		videofile: "",
		notes: "",
		channelId,
		userId,
		ideaId,
		type: "short",
	});
	const vids = await db.insert(videos).values(video).returning();
	return vids[0];
}

// Function to get a single channel by its ID
export const getVideoSchema = videoSchema.pick({
	id: true,
	userId: true,
});

export async function getVideo({ id }: z.infer<typeof getVideoSchema>) {
	return db.query.videos.findFirst({
		where: eq(videos.id, id),
	});
}

export async function getVideos({ userId }: { userId: string }) {
	return db.query.videos.findMany({
		where: eq(videos.userId, userId),
	});
}

export const deleteVideoSchema = z.object({
	userId: z.string().uuid(),
	videoId: z.string().uuid(),
});
export async function deleteVideo({
	userId,
	videoId,
}: z.infer<typeof deleteVideoSchema>) {
	return db
		.delete(videos)
		.where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
}

export const updateVideoPartialSchema = videoSchema.partial();
export const updateVideoSchema = z.object({
	id: z.string().uuid(),
	userId: z.string().uuid(),
	data: updateVideoPartialSchema,
});

export async function updateVideo({
	userId,
	id,
	data,
}: z.infer<typeof updateVideoSchema>) {
	return db
		.update(videos)
		.set(data)
		.where(and(eq(videos.id, id), eq(videos.userId, userId)));
}
