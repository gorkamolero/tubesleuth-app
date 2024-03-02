import { db } from "~/database";
import { images } from "~/database/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { uuid } from "uuidv4";
import { generateImageMap } from "~/utils/imageMap";
import { generateImageWithLemonfox } from "~/utils/generateImageWithLemonfox";

export const insertImageSchema = createInsertSchema(images);
export type imageSchema = z.infer<typeof insertImageSchema>;

export const createImageSchema = insertImageSchema.pick({
	description: true,
	userId: true,
	videoId: true,
	src: true,
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

	const imagesToInsertParsed = imageMap.map(
		({ title, description, fx, transition, start, end }) =>
			insertImageSchema.parse({
				id: uuid(),
				title,
				description,
				userId,
				videoId,
				fx,
				transition,
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

	const url = await generateImageWithLemonfox({
		description,
	});

	await updateImage({
		userId,
		id: imageId,
		data: { src: url, description },
	});
}