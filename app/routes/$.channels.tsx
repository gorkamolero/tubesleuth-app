import { useRef } from "react";

import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
	useLoaderData,
	Link,
	Form,
	useNavigation,
	Outlet,
} from "@remix-run/react";
import { ArrowRight } from "lucide-react";
import { parseFormAny } from "react-zorm";
import type { z } from "zod";

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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { VOICEMODELS } from "~/database/enums";
import { capitalize } from "~/lib/utils";
import { commitAuthSession, requireAuthSession } from "~/modules/auth";
import type { channelSchema } from "~/modules/channel";
import {
	getChannels,
	updateChannel,
	updateChannelPartialSchema,
	deleteChannel,
	createChannel,
} from "~/modules/channel";
import { isFormProcessing } from "~/utils";
import { assertIsPost, notFound } from "~/utils/http.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const { userId, email } = await requireAuthSession(request);

	const channels = await getChannels({ userId });

	if (!channels) {
		throw notFound(`No channels found for user with id ${userId}`);
	}

	return json({ email, channels });
}

export const action: ActionFunction = async ({ request, params }) => {
	const authSession = await requireAuthSession(request);
	const formData = await request.formData();
	const intent = formData.get("intent") as string;

	assertIsPost(request);

	// THIS IS HOW TO HAVE TWO BUTTONS!!!

	if (intent === "delete") {
		const id = formData.get("id");

		await deleteChannel({
			userId: authSession.userId,
			channelId: id as string,
		});

		return redirect(`/channels`, {
			headers: {
				"Set-Cookie": await commitAuthSession(request, { authSession }),
			},
		});
	} else {
		if (intent === "create") {
			const name = formData.get("name") as string;
			const writingStyle = formData.get("writingStyle") as string;
			const imageStyle = formData.get("imageStyle") as string;
			const voicemodel = formData.get("voicemodel") as string;
			const cta = formData.get("cta") as string;

			await createChannel({
				userId: authSession.userId,
				name,
				writingStyle,
				imageStyle,
				voicemodel,
				cta,
			});
		} else {
			const result = await updateChannelPartialSchema.safeParseAsync(
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
			if (!result.data.id) {
				return json(
					{
						errors: "Channel id is required",
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
			await updateChannel({
				userId: authSession.userId,
				id: result.data.id,
				data: result.data,
			});
		}

		return redirect(`/channels`, {
			headers: {
				"Set-Cookie": await commitAuthSession(request, { authSession }),
			},
		});
	}
};

export default function ChannelsPage() {
	const data = useLoaderData<typeof loader>();

	return (
		<>
			<Appbar title="Channels" />
			<Outlet />
			<HoverGrid>
				{data.channels.map((channel) => (
					<Card key={channel.id}>
						<CardTitle>{channel.name}</CardTitle>
						<CardDescription>{channel.cta}</CardDescription>
						<CardActions>
							<DialogDrawer
								trigger={
									<Button variant="outline">
										<ArrowRight className="mr-2 size-4" />
										Edit
									</Button>
								}
								title="Channel Details"
							>
								<ChannelForm
									channel={
										channel as z.infer<typeof channelSchema>
									}
								/>
							</DialogDrawer>
						</CardActions>
					</Card>
				))}

				<Card>
					<CardTitle>Create new channel</CardTitle>
					<CardActions>
						<DialogDrawer
							trigger={
								<Button variant="outline">
									<ArrowRight className="mr-2 size-4" />
									Create
								</Button>
							}
							title="Create Channel"
						>
							<ChannelForm isNewChannel />
						</DialogDrawer>
					</CardActions>
				</Card>
			</HoverGrid>
		</>
	);
}

const ChannelForm = ({
	channel,
	isNewChannel = false,
}: {
	channel?: z.infer<typeof channelSchema>;
	isNewChannel?: boolean;
}) => {
	const navigation = useNavigation();
	const disabled = isFormProcessing(navigation.state);
	return (
		<>
			<Form
				method="post"
				name="channelForm"
				className="grid items-start gap-4 w-full"
			>
				<div className="grid gap-2">
					<Label htmlFor="name">Channel name</Label>
					<Input name="name" defaultValue={channel?.name || ""} />
				</div>
				<div className="grid gap-2">
					<Label htmlFor="writingStyle">Writing style</Label>
					<Input
						name="writingStyle"
						defaultValue={channel?.writingStyle || ""}
					/>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="imageStyle">Image style</Label>
					<Input
						name="imageStyle"
						defaultValue={channel?.imageStyle || ""}
					/>
				</div>

				<div className="grid w-full gap-2">
					<Label htmlFor="voicemodel" className="mb-2 block">
						Voice Model
					</Label>
					<Select
						name="voicemodel"
						defaultValue={channel?.voicemodel || "onyx"}
					>
						<SelectTrigger className="w-full min-w-[180px]">
							<SelectValue placeholder="Voice model" />
						</SelectTrigger>

						<SelectContent>
							{Object.entries(VOICEMODELS).map(([key, value]) => (
								<SelectItem key={key} value={value}>
									{capitalize(value)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="cta">Call to action</Label>
					<Input name="cta" defaultValue={channel?.cta || ""} />
				</div>

				<input type="hidden" name="id" value={channel?.id} />

				<div className="mt-8 flex w-full justify-end gap-2">
					{isNewChannel ? (
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
