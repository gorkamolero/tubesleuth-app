import { json } from "@remix-run/node";
import { and, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { uuid } from "uuidv4";
import { z } from "zod";

import { db } from "~/database";
import { VOICEMODELS } from "~/database/enums";
import { videos } from "~/database/schema";
import { getSupabaseAdmin, supabaseClient } from "~/integrations/supabase";
import createVoiceover from "~/utils/createVoiceover";
import transcribeAudioFull from "~/utils/transcribeAudioFull";

import { getImagesByVideoId } from "../images";

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
}: z.infer<typeof createVideoSchema>) {
	const id = uuid();
	const video = videoSchema.parse({
		id,
		title,
		description,
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

export async function getVideoWithImages({
	id,
}: z.infer<typeof getVideoSchema>) {
	const video = await getVideo({ id });
	if (!video) {
		return null;
	}
	const images = await getImagesByVideoId({
		videoId: id,
		userId: video.userId as string,
	});
	if (images.length > 0) {
		return { ...video, images };
	} else {
		return video;
	}
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

const voiceOverEnum = z.nativeEnum(VOICEMODELS);
export const voiceOverSchema = z.object({
	userId: z.string().uuid(),
	model: voiceOverEnum,
	videoId: z.string(),
});

export const generateVoiceover = async ({
	userId,
	videoId,
	model,
}: z.infer<typeof voiceOverSchema>) => {
	if (!userId) {
		return json({ error: "userId is required" }, { status: 400 });
	}
	if (!videoId || !model) {
		return json(
			{ error: "videoId and model are required" },
			{ status: 400 },
		);
	}

	try {
		const client = getSupabaseAdmin();

		const video = await getVideo({ id: videoId });

		if (!video || !video.script) {
			return json({ error: "Video not found" }, { status: 404 });
		}

		const voiceoverBuffer = await createVoiceover({
			script: video.script,
			model,
		});

		const vurl = `${userId}/voiceover-${videoId}.mp3`;

		const voiceoverUploadResult = await client.storage
			.from(`voiceovers`)
			.upload(vurl, voiceoverBuffer, {
				cacheControl: "3600",
				upsert: true,
			});

		if (voiceoverUploadResult.error) {
			throw voiceoverUploadResult.error;
		}

		const {
			data: { publicUrl: voiceoverURL },
		} = supabaseClient.storage.from("voiceovers").getPublicUrl(vurl);

		const transcript = await transcribeAudioFull({
			voiceoverUrl: voiceoverURL,
		});

		const turl = `/${userId}/transcript-${videoId}.json`;
		const transcriptUploadResult = await client.storage
			.from("transcripts")
			.upload(turl, JSON.stringify(transcript), {
				cacheControl: "3600",
				upsert: true,
			});

		if (transcriptUploadResult.error) {
			throw transcriptUploadResult.error;
		}

		const {
			data: { publicUrl: transcriptURL },
		} = supabaseClient.storage.from("transcripts").getPublicUrl(turl);

		await updateVideo({
			userId,
			id: videoId,
			data: {
				voiceover: voiceoverURL,
				transcript: transcriptURL,
			},
		});

		return voiceoverURL;
	} catch (error) {
		console.error("Error in voiceover generation:", error);
		throw error;
	}
};
