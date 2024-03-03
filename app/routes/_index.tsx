import { Link } from "@remix-run/react";
import { Welcome } from "~/components/Welcome";
import { BackgroundGradient } from "~/components/ui/background-gradient";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

export default function Home() {
	return (
		<div className="flex h-screen flex-col items-center justify-center space-y-16">
			<h1 className="md:text-4xl text-2xl lg:text-6xl font-bold text-center relative z-20">
				Welcome to Tubesleuth
			</h1>
			<div className="flex gap-8">
				<BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-10 bg-white dark:bg-zinc-900">
					<div className="flex flex-col space-y-4 h-full">
						<p className="text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
							Create new channel
						</p>
						<p className="text-sm text-neutral-600 dark:text-neutral-400">
							Channels are the backbone of your content. They
							define the personality and direction of your videos
						</p>
						<Separator />
						<Button asChild className="mt-auto" variant="outline">
							<Link className="p-4 h-full" to="/channel/new">
								Create new channel
							</Link>
						</Button>
					</div>
				</BackgroundGradient>

				<BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-10 bg-white dark:bg-zinc-900">
					<div className="flex flex-col space-y-4 h-full">
						<p className="text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
							Create new idea
						</p>
						<p className="text-sm text-neutral-600 dark:text-neutral-400">
							Quickly sketch out an idea. Ideas are the seed of
							your future videos. Treat them as notes and come
							back to them later
						</p>
						<Separator />
						<Button asChild className="mt-auto" variant="outline">
							<Link className="p-4 h-full" to="/idea/new">
								Create new idea
							</Link>
						</Button>
					</div>
				</BackgroundGradient>
			</div>
		</div>
	);
}
