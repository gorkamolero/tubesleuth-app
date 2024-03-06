import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { destroyAuthSession } from "~/modules/auth";
import { assertIsPost } from "~/utils";

export async function action({ request }: ActionFunctionArgs) {
	assertIsPost(request);
	const formData = await request.formData();
	const imageIDs = formData.get("imageIDs") as string;

	return destroyAuthSession(request);
}

export async function loader() {
	return redirect("/");
}
