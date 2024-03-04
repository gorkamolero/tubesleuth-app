import { Link, useNavigation } from "@remix-run/react";
import { ActionFunction, json, redirect } from "@remix-run/node";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Form } from "@remix-run/react";
import { createChannel } from "~/modules/channel";
import { Button } from "~/components/ui/button";
import { commitAuthSession, requireAuthSession } from "~/modules/auth";

import { z } from "zod";
import { assertIsPost, isFormProcessing } from "~/utils";
import { parseFormAny, useZorm } from "react-zorm";

import { VOICEMODELS } from "~/database/enums";
import { VoiceOverSelect } from "~/components/VoiceoverSelect";

export const NewChannelFormSchema = z.object({
	name: z.string().min(1, "Channel name is required"),
	cta: z.string().min(1, "CTA is required"),
	writingStyle: z.string().min(1, "Writing style is required"),
	voicemodel: z.enum(Object.values(VOICEMODELS) as [string, ...string[]]),
	imageStyle: z.string().min(1, "Image style is required"),
});

export const action: ActionFunction = async ({ request }) => {
	assertIsPost(request);
	const authSession = await requireAuthSession(request);
	const formData = await request.formData();
	const result = await NewChannelFormSchema.safeParseAsync(
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

	const { name, cta, writingStyle, voicemodel, imageStyle } = result.data;

	const channel = await createChannel({
		name,
		cta,
		writingStyle,
		voicemodel,
		imageStyle,
		userId: authSession.userId,
	});

	return redirect(`/channels/`, {
		headers: {
			"Set-Cookie": await commitAuthSession(request, { authSession }),
		},
	});
};

export default function NewChannel() {
	const zo = useZorm("NewQuestionWizardScreen", NewChannelFormSchema);
	const navigation = useNavigation();
	const disabled = isFormProcessing(navigation.state);

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<h1 className="text-2xl font-bold mb-4">Create a New Channel</h1>
			<Form
				ref={zo.ref}
				method="post"
				className="space-y-6 w-full max-w-md"
			>
				<div>
					<Label htmlFor="name">Channel Name</Label>
					<Input type="text" id="name" name={zo.fields.name()} />
				</div>
				<div>
					<Label htmlFor="cta">CTA</Label>
					<Input type="text" id="cta" name={zo.fields.cta()} />
				</div>
				<div>
					<Label htmlFor="writingStyle">Writing Style</Label>
					<Input
						type="text"
						id="writingStyle"
						name={zo.fields.writingStyle()}
					/>
				</div>

				<VoiceOverSelect name={zo.fields.voicemodel()} />

				<div>
					<Label htmlFor="imageStyle">Image Style</Label>
					<Input
						type="text"
						id="imageStyle"
						name={zo.fields.imageStyle()}
					/>
				</div>
				<Button
					type="submit"
					className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
					disabled={disabled}
				>
					Create Channel
				</Button>
			</Form>
			<Link to="/channels" className="mt-4 text-blue-600 hover:underline">
				Back to Channels
			</Link>
		</div>
	);
}
