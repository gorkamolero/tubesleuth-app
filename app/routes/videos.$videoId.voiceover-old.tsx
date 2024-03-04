import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";
import { useZorm } from "react-zorm";
import { z } from "zod";
import { DialogDrawer } from "~/components/DialogDrawer";
import { VoiceOverSelect } from "~/components/VoiceoverSelect";
import { Button } from "~/components/ui/button";
import Stepper from "~/components/ui/stepper";
import { VOICEMODELS } from "~/database/enums";

import { requireAuthSession, commitAuthSession } from "~/modules/auth";
import { generateVoiceover, getVideo, vidSchema } from "~/modules/videos";
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
	const model = formData.get("model") as VOICEMODELS;

	await generateVoiceover({
		userId: authSession.userId,
		videoId,
		model,
	});

	return redirect(`/videos/${videoId}/transcript`, {
		headers: {
			"Set-Cookie": await commitAuthSession(request, { authSession }),
		},
	});
};

const voiceOverEnum = z.nativeEnum(VOICEMODELS);
export const voiceOverSchema = z.object({
	model: voiceOverEnum,
	videoId: z.string(),
});

export default function VideoDetailsPage() {
	const { video } = useLoaderData<typeof loader>();
	if (!video) throw new Error("Video not found");

	const navigation = useNavigation();
	const disabled = isFormProcessing(navigation.state);

	const createVoiceOver = useZorm("createVoiceOver", voiceOverSchema);

	const hasVoiceover = Boolean(
		video?.voiceover && video.voiceover.length > 0,
	);

	return (
		<DialogDrawer open>
			<Stepper steps={8} currentStep={3} title="Create a voice-over" />
			<Form
				method="post"
				ref={createVoiceOver.ref}
				className="space-y-6 w-full max-w-md flex flex-col items-stretch"
			>
				<VoiceOverSelect name={createVoiceOver.fields.model()} />

				<input
					type="hidden"
					name={createVoiceOver.fields.videoId()}
					value={video.id}
				/>

				<div className="flex space-x-4 justify-end">
					<Button
						type="submit"
						name="createVoiceOver"
						disabled={disabled}
						variant="outline"
					>
						Create Voiceover
					</Button>

					{hasVoiceover && (
						<Button asChild>
							<Link to={`/videos/${video.id}/transcript`}>
								Skip
							</Link>
						</Button>
					)}
				</div>
			</Form>
		</DialogDrawer>
	);
}
