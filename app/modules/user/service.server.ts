import { count, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { db } from "~/database";
import { users } from "~/database/schema";
import {
	createEmailAuthAccount,
	signInWithEmail,
	deleteAuthAccount,
} from "~/modules/auth";
import type { AuthSession } from "~/modules/auth";

import { getChannelNames } from "../channel";
import { getIdeas } from "../ideas";
import { getVideos } from "../videos";
import { getInvitation } from "../invitations";

export const userSchema = createInsertSchema(users);

export async function userHealthCheck() {
	return db.select({ value: count() }).from(users);
}

export async function getUserByEmail(email: string) {
	return db.query.users.findFirst({
		where: eq(users.email, email.toLowerCase()),
	});
}

export async function getCompleteUserByEmail(email: string) {
	const user = await getUserByEmail(email);
	if (!user) return null;
	const userInvitation = await getInvitation(email);
	const userIdeas = await getIdeas({ userId: user.id });
	const userChannels = await getChannelNames({ userId: user.id });
	const userVideos = await getVideos({ userId: user.id });

	return {
		...user,
		invitation: userInvitation,
		ideas: userIdeas,
		channels: userChannels,
		videos: userVideos,
	};
}

async function createUser({
	email,
	userId,
	firstName,
	lastName,
}: Pick<AuthSession, "userId" | "email"> & {
	firstName?: string;
	lastName?: string;
}) {
	const userData = userSchema.parse({
		email,
		id: userId,
		...(firstName && { firstName }),
		...(lastName && { lastName }),
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
	firstName,
	lastName,
}: Pick<AuthSession, "userId" | "email"> & {
	firstName?: string;
	lastName?: string;
}) {
	const user = await createUser({
		userId,
		email,
		...(firstName && { firstName }),
		...(lastName && { lastName }),
	});

	// user account created and have a session but unable to store in User table
	// we should delete the user account to allow retry create account again
	if (!user) {
		await deleteAuthAccount(userId);
		return null;
	}

	return user;
}

export async function createUserAccount({
	email,
	password,
	firstName,
	lastName,
}: {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}): Promise<AuthSession | null> {
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

	const user = await tryCreateUser({ ...authSession, firstName, lastName });

	if (!user) return null;

	return authSession;
}

export async function deleteUserAccount(email: string) {
	const user = await getUserByEmail(email);
	if (!user) return null;

	try {
		const user = await getUserByEmail(email);
		await db.delete(users).where(eq(users.email, email));

		if (user?.id) {
			await deleteAuthAccount(user.id);
		}
	} catch (error) {
		throw error;
	}
}
