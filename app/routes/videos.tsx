import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { LogoutButton, requireAuthSession } from "~/modules/auth";
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

	if (data.videos.length === 0) {
		return (
			<div className="flex h-full flex-col">
				<header className="flex items-center justify-between bg-slate-800 p-4 text-white">
					<h1 className="text-3xl font-bold">
						<Link to=".">Videos</Link>
					</h1>
					<p>{data.email}</p>
					<LogoutButton />
				</header>
				<main className="flex h-full bg-white">
					<div className="h-full w-80 border-r bg-gray-50">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
							<Card>
								<CardHeader>No videos yet</CardHeader>
								<CardContent>
									<Button asChild>
										<Link to="/videos/new">Create new</Link>
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</main>
			</div>
		);
	}
	return (
		<ScrollArea className="w-full h-full">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
				{data.videos.map((video) => (
					<Card key={video.id}>
						<CardHeader>{video.title}</CardHeader>
						<CardContent>
							<p>{video.description}</p>
							<Link
								to={`/video/${video.id}/edit`}
								className="text-blue-500 hover:underline"
							>
								View Video
							</Link>
						</CardContent>
					</Card>
				))}
			</div>
		</ScrollArea>
	);
}
