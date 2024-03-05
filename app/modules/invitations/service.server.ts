import { db } from "~/database";
import { invitations } from "~/database/schema";
import { createInsertSchema } from "drizzle-zod";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const invSchema = createInsertSchema(invitations);

export const getInvitation = async (email: string) => {
	return db.query.invitations.findFirst({
		where: eq(invitations.email, email),
	});
};

const updatePartial = invSchema.partial();
export const updateInvitationSchema = z.object({
	email: z.string().email(),
	data: updatePartial,
});

export const updateInvitation = async ({
	email,
	data,
}: z.infer<typeof updateInvitationSchema>) => {
	return db.update(invitations).set(data).where(eq(invitations.email, email));
};
