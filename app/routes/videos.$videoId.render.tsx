import { useCallback } from "react";

import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import {
	Form,
	Outlet,
	useFetcher,
	useLoaderData,
	useNavigate,
	useNavigation,
} from "@remix-run/react";
import { Player } from "@remotion/player";
import { Video as VideoIcon } from "lucide-react";

import { DialogDrawer } from "~/components/DialogDrawer";
import { RenderProgress } from "~/components/render-progress";
import { Button } from "~/components/ui/button";
import Stepper from "~/components/ui/stepper";
import type {
	TubesleuthProps} from "~/integrations/remotion/Composition";
import {
	Tubesleuth
} from "~/integrations/remotion/Composition";
import {
	COMPOSITION_ID,
	SITE_NAME,
} from "~/integrations/remotion/lib/constants";
import { renderVideo } from "~/integrations/remotion/lib/render-video.server";
import { FPS } from "~/lib/constants";
import type { RenderResponse } from "~/lib/types";
import { convertSecondsToFrames } from "~/lib/utils";
import { requireAuthSession } from "~/modules/auth";
import type { imageSchema } from "~/modules/images";
import { getImagesByVideoId } from "~/modules/images";
import type { vidSchema } from "~/modules/videos";
import { getVideo } from "~/modules/videos";
import { getRequiredParam } from "~/utils";

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

export const action: ActionFunction = async ({ request }) => {
	const formData = await request.formData();

	const inputPropsJSON = formData.get("inputProps");
	const inputProps = JSON.parse(inputPropsJSON as string);

	const renderData = await renderVideo({
		serveUrl: SITE_NAME,
		composition: COMPOSITION_ID,
		inputProps,
		outName: `logo-animation.mp4`,
	});

	return json(renderData);
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

	const sortImageByWhichStartsFirst = (a: any, b: any) =>
		(a.start as number) - (b.start as number);
	const sorted = images.sort(sortImageByWhichStartsFirst);

	const inputProps: TubesleuthProps = {
		videoId: video.id,
		fps: ourFPS,
		script: video.script as string,
		subtitles,
		images: sorted as imageSchema[],
		music:
			(video.music as string) ||
			"https://ezamdwrrzqrnyewhqdup.supabase.co/storage/v1/object/public/assets/deep.mp3?t=2024-03-04T12%3A55%3A07.216Z",
		voiceover: video.voiceover,
		durationInFrames,
	};

	const navigate = useNavigate();
	const { state } = useNavigation();

	const fetcher = useFetcher<RenderResponse>();

	const onClick = useCallback(
		(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			e.preventDefault();
			const data = new FormData();
			data.append("inputProps", JSON.stringify(inputProps));
			fetcher.submit(data, { method: "post" });
		},
		[fetcher, inputProps],
	);

	return (
		<DialogDrawer
			open
			title="Your video"
			onClose={() => navigate("/videos/")}
		>
			<Stepper steps={8} currentStep={8} title="Play your video!">
				<fetcher.Form name="render" method="post">
					<Button
						type="button"
						name="intent"
						value="render"
						onClick={onClick}
					>
						<VideoIcon className="mr-2" />
						Render it!
					</Button>
				</fetcher.Form>
			</Stepper>

			<div
				className="flex w-full flex-col items-center justify-center"
				style={{ aspectRatio: "9 / 16" }}
			>
				{fetcher.data ? (
					<RenderProgress
						bucketName={fetcher.data.bucketName}
						renderId={fetcher.data.renderId}
					/>
				) : fetcher.state === "submitting" ? (
					<div>Invoking</div>
				) : (
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
				)}
			</div>
		</DialogDrawer>
	);
}
