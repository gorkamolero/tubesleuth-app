import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { requireAuthSession, commitAuthSession } from "~/modules/auth";
import { getChannel, deleteChannel } from "~/modules/channel";
import { assertIsDelete, getRequiredParam } from "~/utils";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const { userId } = await requireAuthSession(request);
	const channelId = getRequiredParam(params, "channelId");

	const channel = await getChannel({ userId, channelId });
	if (!channel) {
		throw new Response("Not Found", { status: 404 });
	}
	return json({ channel });
}

export async function action({ request, params }: ActionFunctionArgs) {
	assertIsDelete(request);
	const channelId = getRequiredParam(params, "channelId");
	const authSession = await requireAuthSession(request);

	await deleteChannel({ userId: authSession.userId, channelId });

	return redirect("/channels", {
		headers: {
			"Set-Cookie": await commitAuthSession(request, { authSession }),
		},
	});
}

export default function ChannelDetailsPage() {
	const { channel } = useLoaderData<typeof loader>();

	return (
		<div className="p-4">
			<h3 className="text-2xl font-bold">{channel.name}</h3>
			<p className="py-6">CTA: {channel.cta}</p>
			<p className="py-6">Writing Style: {channel.writingStyle}</p>
			<p className="py-6">Voice Model: {channel.voicemodel}</p>
			<p className="py-6">Image Style: {channel.imageStyle}</p>
			<Form method="delete" className="flex justify-end">
				<button
					type="submit"
					className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400"
				>
					Delete Channel
				</button>
			</Form>
		</div>
	);
}
