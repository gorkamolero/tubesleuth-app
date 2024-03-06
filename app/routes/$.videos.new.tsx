import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
	useLoaderData,
	json,
	redirect,
	Form,
	useNavigation,
} from "@remix-run/react";
import { parseFormAny, useZorm } from "react-zorm";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { requireAuthSession } from "~/modules/auth";
import { getChannelNames } from "~/modules/channel";
import { createVideo } from "~/modules/videos";
import { assertIsPost, isFormProcessing, notFound } from "~/utils";

export async function loader({ request }: LoaderFunctionArgs) {
	const { userId, email } = await requireAuthSession(request);

	const channels = await getChannelNames({ userId });

	if (!channels) {
		throw notFound(`No channels found for user with email ${email}`);
	}

	return json({ email, channels });
}

export const NewVideoFormSchema = z.object({
	channelId: z.string().min(1, "Channel is required"),
	description: z.string().min(1, "Description is required"),
});

export const action: ActionFunction = async ({ request }) => {
	assertIsPost(request);
	const authSession = await requireAuthSession(request);
	const formData = await request.formData();
	const result = await NewVideoFormSchema.safeParseAsync(
		parseFormAny(formData),
	);

	if (!result.success) {
		return json({ errors: result.error }, { status: 400 });
	}

	const { channelId, description } = result.data;
	const video = await createVideo({
		description, // Assuming 'input' is used for the video description
		channelId,
		userId: authSession.userId,
	});

	return redirect(`/video/${video.id}/script`);
};

export default function NewVideo() {
	const { channels } = useLoaderData<typeof loader>();
	const zo = useZorm("NewVideoForm", NewVideoFormSchema);
	const navigation = useNavigation();
	const disabled = isFormProcessing(navigation.state);

	return (
		<div className="flex h-screen flex-col items-center justify-center">
			<h1 className="mb-4 text-2xl font-bold">Create a New Video</h1>
			<Form
				ref={zo.ref}
				method="post"
				className="w-full max-w-md space-y-6"
			>
				<div>
					<Select name={zo.fields.channelId()}>
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
				<div>
					<Textarea
						id="description"
						name={zo.fields.description()}
						placeholder="Video Description"
					/>
				</div>
				<Button type="submit" disabled={disabled}>
					Create Video
				</Button>
			</Form>
		</div>
	);
}
