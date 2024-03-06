import { useState } from "react";

import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
	Form,
	useLoaderData,
	useNavigate,
	useNavigation,
} from "@remix-run/react";
import { useZorm } from "react-zorm";
import { jsonWithError, redirectWithSuccess } from "remix-toast";
import { toast } from "sonner";

import { DialogDrawer } from "~/components/DialogDrawer";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input-gradient";
import { Label } from "~/components/ui/label";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import Stepper from "~/components/ui/stepper";
import { Textarea } from "~/components/ui/textarea-gradient";
import { requireAuthSession, commitAuthSession } from "~/modules/auth";
import { getChannels } from "~/modules/channel";
import {
	getIdea,
	generateScriptSchema,
	generateScript,
	updateIdea,
} from "~/modules/ideas";
import type { vidSchema } from "~/modules/videos";
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
	const title = formData.get("title") as string;

	if (!channelId) {
		return jsonWithError(
			{ channelId: "Channel is required" },
			"Please select a channel",
		);
	}

	await updateIdea({
		userId: authSession.userId,
		id: ideaId,
		data: {
			description,
			title,
		},
	});

	const video = await generateScript({
		userId: authSession.userId,
		title,
		description,
		ideaId,
		channelId,
	});

	const { id } = video as vidSchema;
	return redirectWithSuccess(`/videos/${id}/script`, `Script generated!`, {
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

	const [title, setTitle] = useState(idea.title || "");
	const [description, setDescription] = useState(idea.description || "");

	const navigate = useNavigate();

	return (
		<DialogDrawer open onClose={() => navigate("/ideas/")}>
			<Stepper steps={8} currentStep={1} title="Prepare your idea" />
			<Form
				ref={gen.ref}
				method="post"
				className="flex w-full max-w-md flex-col items-stretch space-y-6"
			>
				<div className="grid gap-2">
					<Label htmlFor="title">Give your idea a title</Label>
					<Input
						name="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						name="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="h-32 w-full rounded-md border border-gray-300 p-2"
					/>
				</div>

				<div className="grid gap-2">
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

				<div className="flex w-full justify-end gap-2">
					<Button
						type="submit"
						name="generate"
						variant="default"
						disabled={disabled}
						onClick={() =>
							toast.info(
								"Generating script. This can take a while...",
							)
						}
					>
						{disabled && <LoadingSpinner className="mr-2" />}
						Write script
					</Button>
				</div>
			</Form>
		</DialogDrawer>
	);
}
