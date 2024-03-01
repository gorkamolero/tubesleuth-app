import { db } from "~/database";
import { channels, videos, users } from "~/database/schema";
import { getChannel } from "../channel";
import { TypedResponse, json } from "@remix-run/node";
import { askAssistant } from "~/utils/openai";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { uuid } from "uuidv4";

export const videoSchema = createInsertSchema(videos);
export type vidSchema = z.infer<typeof videoSchema>;

export const createVideoSchema = videoSchema.pick({
	input: true,
	userId: true,
	channelId: true,
});

// Function to create a new channel
export async function createVideo({
	input,
	channelId,
	userId,
}: z.infer<typeof createVideoSchema>) {
	const id = uuid();
	const video = videoSchema.parse({
		id,
		input,
		title: "",
		description: "",
		tags: "",
		script: "",
		uploaded: false,
		voiceover: "",
		videofile: "",
		notes: "",
		channelId,
		userId,
		type: "short", // Explicitly setting the type to 'short'
	});
	const vids = await db.insert(videos).values(video).returning();
	return vids[0];
}

export const createFullSchema = videoSchema.pick({
	input: true,
	title: true,
	description: true,
	tags: true,
	script: true,
	voiceover: true,
	videofile: true,
	notes: true,
	channelId: true,
	userId: true,
});

export async function createVideoFull({
	input,
	title,
	description,
	tags,
	script,
	voiceover,
	videofile,
	notes,
	channelId,
	userId,
}: z.infer<typeof createFullSchema>) {
	const id = uuid();
	const fullVideo = videoSchema.parse({
		input,
		title,
		description,
		tags,
		script,
		uploaded: false, // Assuming a new video is not uploaded initially
		voiceover,
		videofile,
		notes,
		channelId,
		userId,
		type: "short",
		id,
	});
	return db.insert(videos).values(fullVideo).returning();
}

// Function to get a single channel by its ID
export const getVideoSchema = videoSchema.pick({
	id: true,
	serId: true,
});

export async function getVideo({ id }: z.infer<typeof getVideoSchema>) {
	if (!id) {
		return json({ error: "Invalid channelId or userId" }, { status: 400 });
	}
	return db.query.videos.findFirst({
		where: eq(videos.id, id),
	});
}

// Function to get all channels for a user
export async function getVideos({ userId }: { userId: string }) {
	if (!userId) {
		return json({ error: "Invalid userId" }, { status: 400 });
	}

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
		.delete(channels)
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

export const generateScriptSchema = z.object({
	videoId: z.string().uuid(),
	channelId: z.string().uuid(),
	userId: z.string(),
	input: z.string(),
});

export const generateScript = async ({
	videoId,
	channelId,
	userId,
	input,
}: z.infer<typeof generateScriptSchema>) => {
	// get channel
	if (!channelId || !userId || !videoId || !input) {
		return json({ error: "Invalid channelId or userId" }, { status: 400 });
	}
	const channel = await getChannel({ channelId, userId });
	if (!channel) {
		return json({ error: "channels not found" }, { status: 404 });
	}

	const { writingStyle, cta } = channel;

	const message = `${input}. Style: ${writingStyle}. CTA: ${cta}`;

	const { script, tags, description, title } = await askAssistant({
		message,
		isJSON: true,
	});

	const video = await updateVideo({
		userId,
		id: videoId,
		data: {
			script,
			tags,
			description,
			title,
		},
	});

	return json({ video });
};
