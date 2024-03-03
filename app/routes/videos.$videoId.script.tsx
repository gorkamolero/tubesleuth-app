import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { parseFormAny, useZorm } from "react-zorm";
import { z } from "zod";
import { DialogDrawer } from "~/components/DialogDrawer";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input-gradient";
import { Label } from "~/components/ui/label";
import Stepper from "~/components/ui/stepper";
import { Textarea } from "~/components/ui/textarea-gradient";

import { requireAuthSession, commitAuthSession } from "~/modules/auth";
import {
	getVideo,
	updateVideo,
	updateVideoPartialSchema,
	vidSchema,
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
	assertIsPost(request);
	const formData = await request.formData();
	const videoId = getRequiredParam(params, "videoId");
	const authSession = await requireAuthSession(request);

	const result = await updateVideoPartialSchema.safeParseAsync(
		parseFormAny(formData),
	);

	if (!result.success) {
		return json(
			{
				errors: result.error,
			},
			{
				status: 400,
				headers: {
					"Set-Cookie": await commitAuthSession(request, {
						authSession,
					}),
				},
			},
		);
	}

	await updateVideo({
		userId: authSession.userId,
		id: videoId,
		data: result.data,
	});

	return redirect(`/videos/${videoId}/images`, {
		headers: {
			"Set-Cookie": await commitAuthSession(request, { authSession }),
		},
	});
};

const partialUpdateSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	tags: z.string().min(1, "Tags are required"),
	script: z.string().min(1, "Script is required"),
});

export default function VideoDetailsPage() {
	const { video } = useLoaderData<typeof loader>();
	if (!video) throw new Error("Video not found");

	const navigation = useNavigation();
	const disabled = isFormProcessing(navigation.state);

	const [formData] = useState({
		title: video.title || "",
		description: video.description || "",
		tags: video.tags || "",
		script: video.script || "",
	});

	const update = useZorm("update", partialUpdateSchema);

	return (
		<DialogDrawer open>
			<Stepper steps={8} currentStep={2} title="Review your script" />
			<Form
				method="post"
				ref={update.ref}
				className="space-y-6 w-full flex flex-col items-stretch"
			>
				<div className="grid gap-2">
					<Label htmlFor="title">Title</Label>
					<Input
						type="text"
						name="title"
						defaultValue={formData.title}
					/>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						name="description"
						defaultValue={formData.description}
					/>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="tags">Tags</Label>
					<Input
						type="text"
						id="tags"
						name="tags"
						defaultValue={formData.tags}
					/>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="script">Script</Label>
					<Textarea
						id="script"
						name="script"
						className="min-h-64"
						defaultValue={formData.script}
					/>
				</div>

				<div className="flex space-x-4 justify-end">
					<Button
						type="submit"
						name="update"
						disabled={disabled}
						variant="outline"
					>
						Save changes
					</Button>

					<Button asChild>
						<Link to={`/videos/${video.id}/voiceover`}>OK</Link>
					</Button>
				</div>
			</Form>
		</DialogDrawer>
	);
}
