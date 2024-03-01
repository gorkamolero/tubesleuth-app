import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link, Outlet } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

import { LogoutButton, requireAuthSession } from "~/modules/auth";
import { getChannels } from "~/modules/channel"; // Adjust this import based on your actual module
import { notFound } from "~/utils/http.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const { userId, email } = await requireAuthSession(request);

	const channels = await getChannels({ userId });

	if (!channels) {
		throw notFound(`No channels found for user with id ${userId}`);
	}

	return json({ email, channels });
}

export default function ChannelsPage() {
	const data = useLoaderData<typeof loader>();

	return (
		<div className="flex h-full min-h-screen flex-col">
			<header className="flex items-center justify-between bg-slate-800 p-4 text-white">
				<h1 className="text-3xl font-bold">
					<Link to=".">Channels</Link>
				</h1>
				<p>{data.email}</p>
				<LogoutButton />
			</header>

			<main className="flex h-full bg-white">
				<div className="h-full w-80 border-r bg-gray-50">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
						{data.channels.length === 0 ? (
							<Card>
								<CardHeader>No channels yet</CardHeader>
								<CardContent>
									<Button asChild>
										<Link to="/channels/new">
											Create new
										</Link>
									</Button>
								</CardContent>
							</Card>
						) : (
							data.channels.map((channel) => (
								<div
									key={channel.id}
									className="border rounded-lg p-4 shadow"
								>
									<h2 className="text-xl font-bold">
										{channel.name}
									</h2>
									<p>{channel.cta}</p>
									{/* Add more channel details here */}
									<Link
										to={channel.id}
										className="text-blue-500 hover:underline"
									>
										View Channel
									</Link>
								</div>
							))
						)}
					</div>

					<div className="flex-1 p-6">
						<Outlet />
					</div>
				</div>
			</main>
		</div>
	);
}
