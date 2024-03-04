import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
	Form,
	Link,
	useLoaderData,
	useNavigate,
	useNavigation,
} from "@remix-run/react";
import { redirectWithSuccess } from "remix-toast";
import { toast } from "sonner";
import { z } from "zod";
import { AudioSelector } from "~/components/AudioSelector";
import { DialogDrawer } from "~/components/DialogDrawer";
import { Button } from "~/components/ui/button";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import Stepper from "~/components/ui/stepper";
import { VOICEMODELS } from "~/database/enums";
import { voicemodelAudios } from "~/lib/constants";

import { requireAuthSession, commitAuthSession } from "~/modules/auth";
import {
	generateVoiceover,
	getVideo,
	updateVideo,
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
	const model = formData.get("model") as VOICEMODELS;

	await updateVideo({
		id: videoId,
		userId: authSession.userId,
		data: {
			voiceover: model,
		},
	});

	await generateVoiceover({
		userId: authSession.userId,
		videoId,
		model,
	});

	return redirectWithSuccess(
		`/videos/${videoId}/transcript`,
		"Voice-over generated!",
		{
			headers: {
				"Set-Cookie": await commitAuthSession(request, { authSession }),
			},
		},
	);
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

	const hasVoiceover = Boolean(
		video?.voiceover && video.voiceover.length > 0,
	);

	const navigate = useNavigate();

	return (
		<DialogDrawer open onClose={() => navigate(`/videos/`)}>
			<Stepper steps={8} currentStep={3} title="Create a voice-over" />
			<Form
				method="post"
				name="createVoiceOver"
				className="space-y-6 w-full max-w-md flex flex-col items-stretch"
			>
				<AudioSelector name={"model"} tracks={voicemodelAudios} />

				<div className="flex space-x-4 justify-end">
					<Button
						type="submit"
						name="createVoiceOver"
						disabled={disabled}
						onClick={() => {
							toast.info("Generating voice-over...");
						}}
					>
						{disabled && <LoadingSpinner className="mr-2" />}
						Create Voiceover
					</Button>

					{hasVoiceover && (
						<Button asChild variant="outline">
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
