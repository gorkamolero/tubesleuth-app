import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { Player } from "@remotion/player";
import { DialogDrawer } from "~/components/DialogDrawer";
import Stepper from "~/components/ui/stepper";
import {
	Tubesleuth,
	TubesleuthProps,
} from "~/integrations/remotion/Composition";
import { FPS } from "~/lib/constants";
import { convertSecondsToFrames } from "~/lib/utils";

import { requireAuthSession, commitAuthSession } from "~/modules/auth";
import { getImagesByVideoId, imageSchema } from "~/modules/images";
import { getVideo, vidSchema } from "~/modules/videos";
import { assertIsPost, getRequiredParam } from "~/utils";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const { userId } = await requireAuthSession(request);
	const videoId = getRequiredParam(params, "videoId");

	const video = (await getVideo({ id: videoId })) as vidSchema;
	if (!video) {
		throw new Response("Not Found", { status: 404 });
	}

	if (!video.transcript) {
		throw new Response("Transcript not found", { status: 404 });
	}
	const transcriptRequest = await fetch(video.transcript);
	const transcript = await transcriptRequest.json();

	const imagesForVideo = await getImagesByVideoId({
		videoId,
		userId: userId,
	});

	return json({
		video,
		transcript,
		images: imagesForVideo as imageSchema[],
	});
}

export const action: ActionFunction = async ({ request, params }) => {
	assertIsPost(request);
	const videoId = getRequiredParam(params, "videoId");
	const authSession = await requireAuthSession(request);

	return redirect(`/videos/${videoId}/images`, {
		headers: {
			"Set-Cookie": await commitAuthSession(request, { authSession }),
		},
	});
};

export default function VideoDetailsPage() {
	const { video, transcript, images } = useLoaderData<typeof loader>();
	if (!video || !transcript) throw new Error("Video not found");

	const ourFPS = FPS;

	const duration = Math.min(transcript.audio_duration + 2, 60);

	const durationInFrames = convertSecondsToFrames(duration, ourFPS);

	const subtitles = transcript.words.map(
		(w: { text: string; start: number; end: number }) => ({
			text: w.text,
			start: w.start,
			end: w.end,
		}),
	);

	const inputProps: TubesleuthProps = {
		videoId: video.id,
		fps: ourFPS,
		script: video.script as string,
		subtitles,
		images: images as imageSchema[],
		music:
			(video.music as string) ||
			"https://ezamdwrrzqrnyewhqdup.supabase.co/storage/v1/object/public/assets/deep.mp3?t=2024-03-04T12%3A55%3A07.216Z",
		voiceover: video.voiceover,
		duration,
	};

	return (
		<DialogDrawer open title="Your video">
			<Stepper steps={8} currentStep={8} title="Play your video!" />

			<div>
				<Player
					component={Tubesleuth}
					inputProps={inputProps}
					durationInFrames={durationInFrames}
					compositionWidth={1080}
					compositionHeight={1920}
					fps={ourFPS}
					style={{
						width: "100%",
						aspectRatio: "9/16",
					}}
					controls
				/>
			</div>
		</DialogDrawer>
	);
}
