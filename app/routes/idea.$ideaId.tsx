import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { useZorm } from "react-zorm";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";

import { requireAuthSession, commitAuthSession } from "~/modules/auth";
import { getChannels } from "~/modules/channel";
import { getIdea, generateScriptSchema, generateScript } from "~/modules/ideas";
import { vidSchema } from "~/modules/videos";
import { assertIsPost, getRequiredParam, isFormProcessing } from "~/utils";

export async function loader({ params, request }: LoaderFunctionArgs) {
	const { userId } = await requireAuthSession(request);
	const ideaId = getRequiredParam(params, "ideaId");

	const idea = await getIdea({ id: ideaId, userId });
	if (!idea) {
		throw new Response("Not Found", { status: 404 });
	}

	const channels = await getChannels({ userId });

	return json({ idea, channels });
}

export const action: ActionFunction = async ({ request, params }) => {
	const formData = await request.formData();
	const ideaId = getRequiredParam(params, "ideaId");
	const authSession = await requireAuthSession(request);

	assertIsPost(request);
	const channelId = formData.get("channelId") as string;
	const description = formData.get("description") as string;

	const video = await generateScript({
		userId: authSession.userId,
		description,
		ideaId,
		channelId,
	});

	const { id } = video as vidSchema;
	return redirect(`/video/${id}/edit`, {
		headers: {
			"Set-Cookie": await commitAuthSession(request, { authSession }),
		},
	});
};

export default function IdeaDetailsPage() {
	const { idea, channels } = useLoaderData<typeof loader>();
	if (!idea) throw new Error("Idea not found");
	if (!channels) throw new Error("Channels not found");

	const navigation = useNavigation();
	const disabled = isFormProcessing(navigation.state);

	const gen = useZorm("generate", generateScriptSchema);

	const [description, setDescription] = useState(idea.description || "");

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<Form
				ref={gen.ref}
				method="post"
				className="space-y-6 w-full max-w-md flex flex-col items-stretch"
			>
				<h1 className="text-2xl font-bold">Generate a Script</h1>
				<Label htmlFor="description">Title: {idea.title}</Label>
				<Textarea
					id="description"
					name="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className="w-full h-32 border border-gray-300 rounded-md p-2"
				/>

				<div>
					<Label htmlFor="channelId">
						Choose a channel for your script
					</Label>
					<Select name="channelId">
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select Channel" />
						</SelectTrigger>
						<SelectContent>
							{channels.map((channel) => (
								<SelectItem key={channel.id} value={channel.id}>
									{channel.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

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
