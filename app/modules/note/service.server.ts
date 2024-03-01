import { db } from "~/database";
import { notes, users } from "~/database/schema";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { userSchema } from "../user";

const noteSchema = createSelectSchema(notes);

const noteInsertSchema = createInsertSchema(notes).pick({
	title: true,
	body: true,
	userId: true,
});

export async function getNote({ userId, id }: z.infer<typeof noteSchema>) {
	if (!id || !userId) return null;
	return db
		.select({
			id: notes.id,
			title: notes.title,
		})
		.from(notes)
		.where(and(eq(notes.id, id), eq(notes.userId, userId)));
}

export async function getNotes({
	userId,
}: {
	userId: z.infer<typeof userSchema>["id"];
}) {
	if (!userId) return null;

	return db.query.notes.findMany({
		columns: {
			id: true,
			title: true,
			updatedAt: true,
		},
		where: eq(notes.userId, userId),
		orderBy: desc(notes.updatedAt),
	});
}

export async function createNote({
	title,
	body,
	userId,
}: z.infer<typeof noteInsertSchema>) {
	return db
		.insert(notes)
		.values({
			title,
			body,
			userId,
		})
		.returning();
}

const noteDeleteSchema = createInsertSchema(notes).pick({
	id: true,
	userId: true,
});

export async function deleteNote({
	id,
	userId,
}: z.infer<typeof noteDeleteSchema>) {
	if (!id || !userId) return null;
	return db
		.delete(notes)
		.where(and(eq(notes.id, id), eq(notes.userId, userId)));
}
