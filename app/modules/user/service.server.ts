import { z } from "zod";
import { db } from "~/database";
import { users } from "~/database/schema";
import { createInsertSchema } from "drizzle-zod";
import {
	createEmailAuthAccount,
	signInWithEmail,
	deleteAuthAccount,
} from "~/modules/auth";
import type { AuthSession } from "~/modules/auth";
import { eq } from "drizzle-orm";

export const userSchema = createInsertSchema(users);

export async function getUserByEmail(email: string) {
	return db.query.users.findFirst({
		where: eq(users.email, email.toLowerCase()),
	});
}

async function createUser({
	email,
	userId,
}: Pick<AuthSession, "userId" | "email">) {
	const userData = userSchema.parse({
		email,
		id: userId,
	});

	return db
		.insert(users)
		.values(userData)
		.returning()
		.catch(() => null);
}

export async function tryCreateUser({
	email,
	userId,
}: Pick<AuthSession, "userId" | "email">) {
	const user = await createUser({
		userId,
		email,
	});

	// user account created and have a session but unable to store in User table
	// we should delete the user account to allow retry create account again
	if (!user) {
		await deleteAuthAccount(userId);
		return null;
	}

	return user;
}

export async function createUserAccount(
	email: string,
	password: string,
): Promise<AuthSession | null> {
	const authAccount = await createEmailAuthAccount(email, password);

	// ok, no user account created
	if (!authAccount) return null;

	const authSession = await signInWithEmail(email, password);

	// user account created but no session 😱
	// we should delete the user account to allow retry create account again
	if (!authSession) {
		await deleteAuthAccount(authAccount.id);
		return null;
	}

	const user = await tryCreateUser(authSession);

	if (!user) return null;

	return authSession;
}
