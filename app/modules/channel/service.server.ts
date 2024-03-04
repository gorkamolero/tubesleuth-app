import { z } from "zod";
import { db } from "~/database";
import { and, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { uuid } from "uuidv4";
import { channels } from "~/database/schema";

export const channelSchema = createInsertSchema(channels);

// Function to create a new channel
const partialChannelSchema = channelSchema.pick({
	name: true,
	cta: true,
	writingStyle: true,
	voicemodel: true,
	imageStyle: true,
	userId: true,
});

export async function createChannel(
	input: z.infer<typeof partialChannelSchema>,
) {
	const id = uuid();
	const channel = channelSchema.parse({
		...input,
		id,
	});
	const result = await db.insert(channels).values(channel).returning();
	return result[0]; // Return the first (and in this case, only) element of the array
}

// Function to get a single channel by its ID
export async function getChannel({
	channelId,
	userId,
}: {
	channelId: string;
	userId: string;
}) {
	return db.query.channels.findFirst({
		where: and(eq(channels.id, channelId), eq(channels.userId, userId)),
	});
}

export async function getChannels({ userId }: { userId: string }) {
	return db.query.channels.findMany({
		where: eq(channels.userId, userId),
	});
}

export async function getChannelNames({ userId }: { userId: string }) {
	return db
		.select({
			id: channels.id,
			name: channels.name,
		})
		.from(channels)
		.where(eq(channels.userId, userId));
}

export const updateChannelPartialSchema = channelSchema.partial();
export const updateChannelSchema = z.object({
	id: z.string(),
	userId: z.string(),
	data: updateChannelPartialSchema,
});

export const updateChannel = async ({
	userId,
	id,
	data,
}: z.infer<typeof updateChannelSchema>) => {
	return db
		.update(channels)
		.set(data)
		.where(and(eq(channels.id, id), eq(channels.userId, userId)));
};

export async function deleteChannel({
	userId,
	channelId,
}: {
	userId: string;
	channelId: string;
}) {
	return db
		.delete(channels)
		.where(and(eq(channels.id, channelId), eq(channels.userId, userId)));
}
