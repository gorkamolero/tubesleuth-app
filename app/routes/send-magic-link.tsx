import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { parseFormAny } from "react-zorm";
import { jsonWithError } from "remix-toast";
import { z } from "zod";

import { sendMagicLink } from "~/modules/auth";
import { getInvitation } from "~/modules/invitations";
import { assertIsPost } from "~/utils/http.server";

export async function action({ request }: ActionFunctionArgs) {
	assertIsPost(request);

	const formData = await request.formData();

	const emailForForm = formData.get("email") as string;
	const invitation = await getInvitation(emailForForm);
	if (!invitation) {
		return jsonWithError(null, {
			message: "Invitation only!",
			description: "The app is still in alpha. Contact us",
		});
	}

	const result = await z
		.object({
			email: z
				.string()
				.email("Invalid email")
				.transform((email) => email.toLowerCase()),
		})
		.safeParseAsync(parseFormAny(formData));

	if (!result.success) {
		return jsonWithError(null, "Invalid email", { status: 400 });
	}

	const { error } = await sendMagicLink(result.data.email);

	if (error) {
		console.error(error);
		return json(
			{
				error: "unable-to-send-magic-link",
			},
			{ status: 500 },
		);
	}

	return json({ error: null });
}
