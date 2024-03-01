import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { requireAuthSession } from "~/modules/auth";
import { getVideos } from "~/modules/videos";
import { notFound } from "~/utils";

export async function loader({ request }: LoaderFunctionArgs) {
	const { userId, email } = await requireAuthSession(request);

	const videos = await getVideos({ userId });

	if (!videos) {
		throw notFound(`No videos found for user with id ${userId}`);
	}

	return json({ email, videos });
}

export default function VideosPage() {
	const data = useLoaderData<typeof loader>();

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
			{data.videos.map((video) => (
				<Card key={video.id}>
					<CardHeader>{video.title}</CardHeader>
					<CardContent>
						<p>{video.description}</p>
						<Link
							to={`/video/${video.id}`}
							className="text-blue-500 hover:underline"
						>
							View Video
						</Link>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
