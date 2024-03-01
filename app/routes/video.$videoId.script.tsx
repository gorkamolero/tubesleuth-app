import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { parseFormAny, useZorm } from "react-zorm";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

import { requireAuthSession, commitAuthSession } from "~/modules/auth";
import {
	getVideo,
	vidSchema,
	generateScriptSchema,
	updateVideoPartialSchema,
	updateVideo,
	generateScript,
} from "~/modules/videos";
import { assertIsPost, getRequiredParam, isFormProcessing } from "~/utils";

export async function loader({ params }: LoaderFunctionArgs) {
	const videoId = getRequiredParam(params, "videoId");

	const video = (await getVideo({ id: videoId })) as vidSchema;
	if (!video) {
		throw new Response("Not Found", { status: 404 });
	}
	return json({ video });
}

export const action: ActionFunction = async ({ request, params }) => {
	const formData = await request.formData();
	const videoId = getRequiredParam(params, "videoId");
	const authSession = await requireAuthSession(request);

	assertIsPost(request);
	const input = formData.get("input") as string;
	const channelId = formData.get("channelId") as string;

	await generateScript({
		userId: authSession.userId,
		videoId,
		input,
		channelId,
	});

	return redirect(`/video/${videoId}/edit`, {
		headers: {
			"Set-Cookie": await commitAuthSession(request, { authSession }),
		},
	});
};

export default function VideoDetailsPage() {
	const { video } = useLoaderData<typeof loader>();
	if (!video) throw new Error("Video not found");

	const navigation = useNavigation();
	const [input, setInput] = useState(video.input || "");
	const disabled = isFormProcessing(navigation.state);

	const gen = useZorm("generate", generateScriptSchema);

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<h1 className="text-2xl font-bold mb-4">Generate Script</h1>
			<Form
				ref={gen.ref}
				method="post"
				className="space-y-6 w-full max-w-md flex flex-col items-stretch"
			>
				<Textarea
					name="input"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					className="w-full h-32 border border-gray-300 rounded-md p-2"
				/>

				<input
					type="hidden"
					name="channelId"
					value={video.channelId || ""}
				/>

				<Button
					type="submit"
					name="generate"
					variant="default"
					disabled={disabled}
				>
					Generate Script
				</Button>
			</Form>
		</div>
	);
}
