// Use this to delete a user by their email
// Simply call this with:
// npx tsx ./cypress/support/delete-user.ts username@example.com
// and that user will get deleted

import { installGlobals } from "@remix-run/node";
import { eq } from "drizzle-orm";

import { db } from "~/database";
import { users } from "~/database/schema";
import { deleteAuthAccount } from "~/modules/auth";
import { getUserByEmail } from "~/modules/user";

installGlobals();

async function deleteUser(email: string) {
	if (!email) {
		throw new Error("email required for login");
	}
	console.log(process.env.NODE_ENV);
	if (!email.endsWith("@example.com")) {
		throw new Error("All test emails must end in @example.com");
	}

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

deleteUser(process.argv[2]);
