import { db } from "~/database";
import { invitations } from "~/database/schema";
import { createInsertSchema } from "drizzle-zod";
import { eq } from "drizzle-orm";

export const invSchema = createInsertSchema(invitations);

export const getInvitation = async (email: string) => {
	return db.query.invitations.findFirst({
		where: eq(invitations.email, email),
	});
};
