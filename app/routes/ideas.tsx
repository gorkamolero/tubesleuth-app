import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { LogoutButton, requireAuthSession } from "~/modules/auth";
import { getIdeas } from "~/modules/ideas";
import { notFound } from "~/utils";

export async function loader({ request }: LoaderFunctionArgs) {
	const { userId, email } = await requireAuthSession(request);

	const ideas = await getIdeas({ userId });

	if (!ideas) {
		throw notFound(`No ideas found for user with id ${userId}`);
	}

	return json({ email, ideas });
}

export default function IdeasPage() {
	const data = useLoaderData<typeof loader>();

	if (data.ideas.length === 0) {
		return (
			<div className="flex h-full min-h-screen flex-col">
				<header className="flex items-center justify-between bg-slate-800 p-4 text-white">
					<h1 className="text-3xl font-bold">
						<Link to=".">Ideas</Link>
					</h1>
					<p>{data.email}</p>
					<LogoutButton />
				</header>
				<main className="flex h-full bg-white">
					<div className="h-full w-80 border-r bg-gray-50">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
							<Card>
								<CardHeader>No ideas yet</CardHeader>
								<CardContent>
									<Button asChild>
										<Link to="/ideas/new">Create new</Link>
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
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
			{data.ideas.map((idea) => (
				<Card key={idea.id}>
					<CardHeader>{idea.title}</CardHeader>
					<CardContent>
						<p>{idea.description}</p>
						<Link
							to={`/idea/${idea.id}`}
							className="text-blue-500 hover:underline"
						>
							View Idea
						</Link>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
