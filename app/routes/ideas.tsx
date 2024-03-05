import type {
	LoaderFunctionArgs,
	ActionFunction} from "@remix-run/node";
import {
	json,
	redirect,
} from "@remix-run/node";
import {
	useLoaderData,
	Form,
	useNavigation,
	Link,
	Outlet,
} from "@remix-run/react";
import { ArrowRight } from "lucide-react";
import { parseFormAny } from "react-zorm";

import { Appbar } from "~/components/Appbar";
import { DialogDrawer } from "~/components/DialogDrawer";
import { HoverGrid } from "~/components/HoverGrid";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardActions,
	CardDescription,
	CardTitle,
} from "~/components/ui/card-hover-effect";
import { Input } from "~/components/ui/input-gradient";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { requireAuthSession, commitAuthSession } from "~/modules/auth";
import type {
	ideaSchema} from "~/modules/ideas";
import {
	getIdeas,
	createIdea,
	updateIdea,
	deleteIdea,
	updateIdeaPartialSchema,
} from "~/modules/ideas";
import { isFormProcessing, notFound, assertIsPost } from "~/utils";

export async function loader({ request }: LoaderFunctionArgs) {
	const { userId, email } = await requireAuthSession(request);

	const ideas = await getIdeas({ userId });

	if (!ideas) {
		throw notFound(`No ideas found for user with id ${userId}`);
	}

	ideas.sort(
		(a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
	);

	return json({ email, ideas });
}

export const action: ActionFunction = async ({ request }) => {
	const authSession = await requireAuthSession(request);
	const formData = await request.formData();
	const intent = formData.get("intent") as string;

	assertIsPost(request);

	if (intent === "delete") {
		const id = formData.get("id") as string;
		await deleteIdea({
			userId: authSession.userId,
			id,
		});

		return redirect(`/ideas/`, {
			headers: {
				"Set-Cookie": await commitAuthSession(request, { authSession }),
			},
		});
	} else if (intent === "create") {
		const description = formData.get("description") as string;

		await createIdea({
			userId: authSession.userId,
			description,
		});

		return redirect(`/ideas/`, {
			headers: {
				"Set-Cookie": await commitAuthSession(request, { authSession }),
			},
		});
	} else {
		const id = formData.get("id") as string;
		const result = await updateIdeaPartialSchema.safeParseAsync(
			parseFormAny(formData),
		);

		if (!result.success) {
			return json(
				{
					errors: result.error,
				},
				{
					status: 400,
					headers: {
						"Set-Cookie": await commitAuthSession(request, {
							authSession,
						}),
					},
				},
			);
		}

		await updateIdea({
			userId: authSession.userId,
			id,
			data: result.data,
		});

		return redirect(`/ideas/`, {
			headers: {
				"Set-Cookie": await commitAuthSession(request, { authSession }),
			},
		});
	}
};

export default function IdeasPage() {
	const data = useLoaderData<typeof loader>();

	return (
		<>
			<Appbar title="Ideas" />
			<HoverGrid>
				{data.ideas.map((idea) => (
					<Card key={idea.id}>
						<CardDescription className="text-2xl text-foreground/70">
							{idea.description}
						</CardDescription>
						<CardActions>
							<DialogDrawer
								trigger={
									<Button variant="outline">Edit</Button>
								}
								title="Idea Details"
							>
								<IdeaForm idea={idea as ideaSchema} />
							</DialogDrawer>

							<Button asChild>
								<Link to={`/ideas/${idea.id}/`}>
									<ArrowRight className="mr-2 size-4" />
									Develop
								</Link>
							</Button>
						</CardActions>
					</Card>
				))}
				<Card>
					<CardTitle>Create new idea</CardTitle>
					<CardActions>
						<DialogDrawer
							trigger={<Button variant="outline">Create</Button>}
							title="Describe your idea"
						>
							<IdeaForm isNewIdea />
						</DialogDrawer>
					</CardActions>
				</Card>
			</HoverGrid>
			<Outlet />
		</>
	);
}

const IdeaForm = ({
	idea,
	isNewIdea = false,
}: {
	idea?: ideaSchema;
	isNewIdea?: boolean;
}) => {
	const navigation = useNavigation();
	const disabled = isFormProcessing(navigation.state);
	return (
		<>
			<Form
				method="post"
				name="ideaForm"
				className="grid items-start gap-4"
			>
				<div className="grid gap-2">
					<Input
						name="description"
						defaultValue={idea?.description || ""}
					/>
				</div>

				<input type="hidden" name="id" value={idea?.id} />

				<div className="mt-8 flex w-full justify-end gap-2">
					{isNewIdea ? (
						<Button
							type="submit"
							disabled={disabled}
							name="intent"
							value="create"
						>
							Create
						</Button>
					) : (
						<>
							<Button
								variant="destructive"
								disabled={disabled}
								name="intent"
								value="delete"
								type="submit"
							>
								Delete
							</Button>
							<Button
								type="submit"
								disabled={disabled}
								name="intent"
								value="update"
							>
								Save changes
							</Button>
						</>
					)}
				</div>
			</Form>
		</>
	);
};
