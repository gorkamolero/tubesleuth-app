import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { redirectWithError } from "remix-toast";

import { BackgroundGradient } from "~/components/ui/background-gradient";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { requireAuthSession } from "~/modules/auth";
import { getCompleteUserByEmail } from "~/modules/user";

export async function loader({ request }: LoaderFunctionArgs) {
	const authSession = await requireAuthSession(request);

	const user = await getCompleteUserByEmail(authSession.email);

	if (!user || !user.invitation) {
		return redirectWithError(
			"/invitation",
			"You need to be invited to access this page",
		);
	}

	return json({ email: authSession.email, user });
}

export default function Home() {
	const { user } = useLoaderData<typeof loader>();
	const hasChannels = user ? user.channels.length > 0 : false;
	const hasVideos = user ? user.videos.length > 0 : false;

	return (
		<div className="flex h-screen flex-col items-center justify-center space-y-16 px-8">
			<h1 className="relative z-20 text-center text-2xl font-bold md:text-4xl lg:text-6xl">
				Welcome to Tubesleuth
			</h1>

			<div className="flex gap-8">
				<BackgroundGradient className="max-w-sm rounded-[22px] bg-white p-4 dark:bg-zinc-900 sm:p-10">
					<div className="flex h-full flex-col space-y-4">
						<p className="mb-2 mt-4 text-base text-black dark:text-neutral-200 sm:text-xl">
							Have an idea?
						</p>
						<p className="text-sm text-neutral-600 dark:text-neutral-400">
							Quickly sketch out an idea. Ideas are the seed of
							your future videos. Treat them as notes and come
							back to them later
						</p>
						<Separator className="mt-auto" />
						<Button asChild variant="outline">
							<Link className="p-4" to="/ideas/new">
								Create new idea
							</Link>
						</Button>
					</div>
				</BackgroundGradient>
				{!hasChannels && !hasVideos ? (
					<BackgroundGradient className="max-w-sm rounded-[22px] bg-white p-4 dark:bg-zinc-900 sm:p-10">
						<div className="flex h-full flex-col space-y-4">
							<p className="mb-2 mt-4 text-base text-black dark:text-neutral-200 sm:text-xl">
								Create new channel
							</p>
							<p className="text-sm text-neutral-600 dark:text-neutral-400">
								Channels are the backbone of your content. They
								define the personality and direction of your
								videos
							</p>
							<Separator />
							<Button
								asChild
								className="mt-auto"
								variant="outline"
							>
								<Link className="h-full p-4" to="/channels/new">
									Create new channel
								</Link>
							</Button>
						</div>
					</BackgroundGradient>
				) : (
					<BackgroundGradient className="max-w-sm rounded-[22px] bg-white p-4 dark:bg-zinc-900 sm:p-10">
						<div className="flex h-full flex-col space-y-4">
							<p className="mb-2 mt-4 text-base text-black dark:text-neutral-200 sm:text-xl">
								Manage your videos
							</p>
							<p className="text-sm text-neutral-600 dark:text-neutral-400">
								Quickly access your videos, ideas and channels
							</p>
							<Separator className="mt-auto" />
							<Button asChild variant="outline">
								<Link className="p-4" to="/videos/">
									Go to your videos
								</Link>
							</Button>
						</div>
					</BackgroundGradient>
				)}
			</div>
		</div>
	);
}
