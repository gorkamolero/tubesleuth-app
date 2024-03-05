import { and, eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { uuid } from "uuidv4";
import { z } from "zod";

import { db } from "~/database";
import { images } from "~/database/schema";
import { getSupabaseAdmin } from "~/integrations/supabase";
import { generateImageWithLemonfox } from "~/utils/generateImageWithLemonfox";
import { generateImageMap } from "~/utils/imageMap";

export const insertImageSchema = createInsertSchema(images);
export type imageSchema = z.infer<typeof insertImageSchema>;

export const createImageSchema = insertImageSchema.pick({
	description: true,
	userId: true,
	videoId: true,
	src: true,
	generated: true,
	fx: true,
	transition: true,
	dimensions: true,
	animation: true,
	generatedAt: true,
	animatedAt: true,
});

export const createManyImagesSchema = z.object({
	descriptions: z.array(z.string()),
	userId: z.string().uuid(),
	videoId: z.string().uuid(),
});

export async function createImage({
	description,
	userId,
}: z.infer<typeof createImageSchema>) {
	const id = uuid();
	const image = insertImageSchema.parse({
		id,
		description,
		userId,
	});
	const imagesdb = await db.insert(images).values(image).returning();
	return imagesdb[0];
}

export async function createManyImages({
	descriptions,
	userId,
	videoId,
}: z.infer<typeof createManyImagesSchema>) {
	const video = await db.query.videos.findFirst({
		where: and(eq(images.id, videoId), eq(images.userId, userId)),
		with: {
			channel: true,
		},
	});

	if (
		!video ||
		!video.channel ||
		!video.channel.imageStyle ||
		!video.transcript ||
		!video.script
	) {
		throw new Error("No channel or image style found");
	}

	// transcript is json, let's download it
	const transcriptRequest = await fetch(video.transcript);
	const transcript = await transcriptRequest.json();

	const imageMap = await generateImageMap({
		userId,
		videoId,
		descriptions,
		imageStyle: video.channel.imageStyle,
		script: video.script,
		transcript,
	});

	const imagesToInsertParsed = imageMap.map(({ description, start, end }) =>
		insertImageSchema.parse({
			id: uuid(),
			description,
			userId,
			videoId,
			fx: "perspective",
			transition: "fade",
			start,
			end,
		}),
	);

	return db.insert(images).values(imagesToInsertParsed).returning();
}

export async function getImage({ id, userId }: { id: string; userId: string }) {
	return db.query.images.findFirst({
		where: and(eq(images.id, id), eq(images.userId, userId)),
	});
}

export async function getImages({ userId }: { userId: string }) {
	return db.query.images.findMany({
		where: eq(images.userId, userId),
	});
}

export async function getImagesByVideoId({
	videoId,
	userId,
}: {
	videoId: string;
	userId: string;
}) {
	return db.query.images.findMany({
		where: and(eq(images.videoId, videoId), eq(images.userId, userId)),
	});
}

export const deleteImageSchema = z.object({
	userId: z.string().uuid(),
	videoId: z.string().uuid(),
});

export async function deleteImage({
	userId,
	videoId,
}: z.infer<typeof deleteImageSchema>) {
	return db
		.delete(images)
		.where(and(eq(images.id, videoId), eq(images.userId, userId)));
}

export const updateImagePartialSchema = createImageSchema.partial();
export const updateImageSchema = z.object({
	id: z.string().uuid(),
	userId: z.string().uuid(),
	data: updateImagePartialSchema,
});

export async function updateImage({
	userId,
	id,
	data,
}: z.infer<typeof updateImageSchema>) {
	return db
		.update(images)
		.set(data)
		.where(and(eq(images.id, id), eq(images.userId, userId)));
}

export const generateImageSchema = z.object({
	imageId: z.string().uuid(),
	userId: z.string().uuid(),
	description: z.string(),
});

export async function generateImage({
	imageId,
	userId,
	description,
}: z.infer<typeof generateImageSchema>) {
	if (!imageId || !description) {
		throw new Error("No image found or no description");
	}

	const remoteUrl = await generateImageWithLemonfox({
		description,
	});

	const imageLocalRequest = await fetch(remoteUrl);
	const imageLocal = await imageLocalRequest.blob();

	const iurl = `${userId}/image-${imageId}.png`;

	const client = getSupabaseAdmin();

	await new Promise((resolve) => setTimeout(resolve, 2000));

	const imageUploadResult = await client.storage
		.from(`images`)
		.upload(iurl, imageLocal, {
			cacheControl: "3600",
			upsert: true,
		});

	if (imageUploadResult.error) {
		throw imageUploadResult.error;
	}

	const {
		data: { publicUrl: imageUrl },
	} = client.storage.from("images").getPublicUrl(iurl);

	await updateImage({
		userId,
		id: imageId,
		data: {
			src: imageUrl,
			description,
			generated: true,
			generatedAt: new Date(),
		},
	});
}

export const countByColumnNameAndDate = async ({
	userId,
	columnName,
}: {
	userId: string;
	columnName: string;
}) => {
	const now = new Date();
	const yesterday = new Date();
	yesterday.setDate(now.getDate() - 1);

	return db.execute(
		sql`SELECT COUNT(*) FROM images WHERE userId = ${userId} AND ${columnName} > ${yesterday}`,
	);
};
