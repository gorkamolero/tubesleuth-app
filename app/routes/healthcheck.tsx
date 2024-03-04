// learn more: https://fly.io/docs/reference/configuration/#services-http_checks
import type { LoaderFunctionArgs } from "@remix-run/node";
import { count } from "drizzle-orm";

import { db } from "~/database";
import { users } from "~/database/schema";

export async function loader({ request }: LoaderFunctionArgs) {
	const host =
		request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");

	try {
		const url = new URL("/", `http://${host}`);
		// if we can connect to the database and make a simple query
		// and make a HEAD request to ourselves, then we're good.
		await Promise.all([
			db.select({ value: count() }).from(users),

			fetch(url.toString(), { method: "HEAD" }).then((r) => {
				if (!r.ok) return Promise.reject(r);
			}),
		]);
		return new Response("OK");
	} catch (error: unknown) {
		// eslint-disable-next-line no-console
		console.log("healthcheck ❌", { error });
		return new Response("ERROR", { status: 500 });
	}
}
