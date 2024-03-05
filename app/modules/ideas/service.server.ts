import { db } from "~/database";
import { ideas } from "~/database/schema";
import { getChannel } from "../channel";
import { json } from "@remix-run/node";
import { askAssistant, askChatGPT, askLemon } from "~/utils/openai";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { uuid } from "uuidv4";
import { createVideo } from "../videos";
import { scriptwriter } from "~/utils/ai/scriptwriter";

export const insertIdeaSchema = createInsertSchema(ideas);
export type ideaSchema = z.infer<typeof insertIdeaSchema>;

export const createIdeaSchema = insertIdeaSchema.pick({
	description: true,
	userId: true,
	videoIds: true,
	title: true,
});

export async function createIdea({
	description,
	userId,
}: z.infer<typeof createIdeaSchema>) {
	const id = uuid();
	const idea = insertIdeaSchema.parse({
		id,
		description,
		userId,
	});
	const ideasdb = await db.insert(ideas).values(idea).returning();
	return ideasdb[0];
}

export async function getIdea({ id, userId }: { id: string; userId: string }) {
	return db.query.ideas.findFirst({
		where: and(eq(ideas.id, id), eq(ideas.userId, userId)),
	});
}

export async function getIdeas({ userId }: { userId: string }) {
	return db.query.ideas.findMany({
		where: eq(ideas.userId, userId),
	});
}

export const deleteIdeaSchema = z.object({
	userId: z.string().uuid(),
	id: z.string().uuid(),
});

export async function deleteIdea({
	userId,
	id,
}: z.infer<typeof deleteIdeaSchema>) {
	return db
		.delete(ideas)
		.where(and(eq(ideas.id, id), eq(ideas.userId, userId)));
}

export const updateIdeaPartialSchema = createIdeaSchema.partial();
export const updateIdeaSchema = z.object({
	id: z.string().uuid(),
	userId: z.string().uuid(),
	data: updateIdeaPartialSchema,
});

export async function updateIdea({
	userId,
	id,
	data,
}: z.infer<typeof updateIdeaSchema>) {
	return db
		.update(ideas)
		.set(data)
		.where(and(eq(ideas.id, id), eq(ideas.userId, userId)));
}

export const generateScriptSchema = z.object({
	ideaId: z.string().uuid(),
	channelId: z.string().uuid(),
	userId: z.string(),
	title: z.string(),
	description: z.string(),
});

export const generateScript = async ({
	ideaId,
	channelId,
	userId,
	description,
}: z.infer<typeof generateScriptSchema>) => {
	// get channel
	if (!channelId || !userId || !ideaId) {
		return json({ error: "Invalid channelId or userId" }, { status: 400 });
	}
	if (!description) {
		return json({ error: "ideas not found" }, { status: 404 });
	}

	const channel = await getChannel({ channelId, userId });
	if (!channel) {
		return json({ error: "channel not found" }, { status: 404 });
	}

	const { writingStyle, cta } = channel;

	const message = `${description}. Style: ${writingStyle}. CTA: ${cta}. ENSURE JSON OUTPUT`;

	const result = await askChatGPT({
		systemMessage: scriptwriter,
		message,
		isJSON: true,
	});

	const {
		// @ts-ignore
		script,
		// @ts-ignore
		description: scriptDescription,
		// @ts-ignore
		title,
	} = result;

	const video = await createVideo({
		userId,
		channelId,
		ideaId,
		script,
		description: scriptDescription,
		title,
	});

	return video;
};
