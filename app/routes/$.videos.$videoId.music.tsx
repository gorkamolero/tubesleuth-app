import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import {
	Form,
	Link,
	useLoaderData,
	useNavigate,
	useNavigation,
} from "@remix-run/react";
import { SparklesIcon } from "lucide-react";
import { z } from "zod";

import { AudioSelector } from "~/components/AudioSelector";
import { DialogDrawer } from "~/components/DialogDrawer";
import { LabelInputContainer } from "~/components/LabelInputContainer";
import { Button } from "~/components/ui/button";
import { GradientSeparator } from "~/components/ui/gradient-separator";
import { Input } from "~/components/ui/input-gradient";
import { Label } from "~/components/ui/label-gradient";
import Stepper from "~/components/ui/stepper";
import { musicAudios } from "~/lib/constants";
import { requireAuthSession, commitAuthSession } from "~/modules/auth";
import type { vidSchema } from "~/modules/videos";
import { getVideo, updateVideo } from "~/modules/videos";
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
	const music = formData.get("music") as string;
	const userMusic = formData.get("userMusic") as string;

	let src = userMusic.length > 0 ? userMusic : music;

	await updateVideo({
		id: videoId,
		userId: authSession.userId,
		data: {
			music: src,
			readyToRender: true,
		},
	});

	return redirect(`/videos/${videoId}/render`, {
		headers: {
			"Set-Cookie": await commitAuthSession(request, { authSession }),
		},
	});
};

export const voiceOverSchema = z.object({
	music: z.string().optional(),
	userMusic: z.string().optional(),
});

export default function VideoDetailsPage() {
	const { video } = useLoaderData<typeof loader>();
	if (!video) throw new Error("Video not found");

	const navigation = useNavigation();
	const disabled = isFormProcessing(navigation.state);

	const hasMusic = !!(video?.music && video.music.length > 0);

	const navigate = useNavigate();

	return (
		<DialogDrawer open onClose={() => navigate("/videos/")}>
			<Stepper steps={8} currentStep={7} title="Choose your music" />
			<Form
				method="post"
				name="chooseMusic"
				className="flex w-full max-w-md flex-col items-stretch space-y-6"
			>
				<AudioSelector name="music" tracks={musicAudios} />

				<GradientSeparator />

				<LabelInputContainer>
					<Label htmlFor="userMusic">
						Or provide a URL with your own
					</Label>
					<Input
						name="userMusic"
						type="url"
						placeholder="https://example.com/music.mp3"
					/>
				</LabelInputContainer>

				<div className="flex justify-end space-x-4">
					<Button
						type="submit"
						name="chooseMusic"
						disabled={disabled}
					>
						<SparklesIcon className="mr-2" />
						Choose and generate video!
					</Button>

					{hasMusic && (
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
