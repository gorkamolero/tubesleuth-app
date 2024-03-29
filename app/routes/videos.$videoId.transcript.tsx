import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { DialogDrawer } from "~/components/DialogDrawer";
import { TranscriptDisplay } from "~/components/TranscriptDisplay";
import { Button } from "~/components/ui/button";
import Stepper from "~/components/ui/stepper";
import { supabaseClient } from "~/integrations/supabase";

import { requireAuthSession } from "~/modules/auth";
import { getVideo, vidSchema } from "~/modules/videos";
import { getRequiredParam } from "~/utils";

export async function loader({ params, request }: LoaderFunctionArgs) {
	const videoId = getRequiredParam(params, "videoId");
	const { userId } = await requireAuthSession(request);

	const video = (await getVideo({ id: videoId })) as vidSchema;
	if (!video) {
		throw new Response("Not Found", { status: 404 });
	}

	const { data: voicedata } = await supabaseClient.storage
		.from("voiceovers")
		.getPublicUrl(`${userId}/voiceover-${video.id}.mp3`);

	const { data: transcriptdata } = await supabaseClient.storage
		.from("transcripts")
		.getPublicUrl(`${userId}/transcript-${video.id}.json`);

	const publicJSONURL = transcriptdata?.publicUrl;
	// download and convert
	const transcript = await fetch(publicJSONURL);
	const transcriptJSON = await transcript.json();

	return json({
		video,
		url: voicedata?.publicUrl,
		transcript: transcriptJSON,
	});
}

export default function VideoDetailsPage() {
	const { video, url, transcript } = useLoaderData<typeof loader>();
	if (!video || !video.title || !video.voiceover || !video.description)
		throw new Error("Video not found");

	const navigate = useNavigate();

	return (
		<DialogDrawer
			open
			className="sm:max-w-[640px]"
			onClose={() => navigate("/videos/")}
		>
			<Stepper steps={8} currentStep={4} title="Review your transcript" />
			<div className="flex flex-col items-center justify-center">
				<div className="space-y-6 w-full flex flex-col items-stretch">
					<h1 className="text-3xl font-bold">{video.title}</h1>

					<TranscriptDisplay src={url} transcript={transcript} />

					<div className="flex space-x-4 justify-end">
						<Button asChild>
							<Link to={`/videos/${video.id}/imagemap`}>
								Next
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</DialogDrawer>
	);
}
