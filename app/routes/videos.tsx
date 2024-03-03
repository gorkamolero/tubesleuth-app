import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
	useLoaderData,
	Link,
	Form,
	useNavigation,
	Outlet,
} from "@remix-run/react";
import { parseFormAny } from "react-zorm";
import { z } from "zod";
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
import { commitAuthSession, requireAuthSession } from "~/modules/auth";
import {
	deleteVideo,
	getVideos,
	updateVideo,
	updateVideoPartialSchema,
	videoSchema,
} from "~/modules/videos";
import { isFormProcessing } from "~/utils";
import { assertIsPost, notFound } from "~/utils/http.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const { userId, email } = await requireAuthSession(request);

	const videos = await getVideos({ userId });

	if (!videos) {
		throw notFound(`No videos found for user with id ${userId}`);
	}

	return json({ email, videos });
}

export const action: ActionFunction = async ({ request, params }) => {
	const authSession = await requireAuthSession(request);
	const formData = await request.formData();
	const intent = formData.get("intent") as string;

	assertIsPost(request);

	if (intent === "delete") {
		const id = formData.get("id");

		await deleteVideo({
			userId: authSession.userId,
			videoId: id as string,
		});

		return redirect(`/videos`, {
			headers: {
				"Set-Cookie": await commitAuthSession(request, { authSession }),
			},
		});
	} else {
		const result = await updateVideoPartialSchema.safeParseAsync(
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
					errors: "Video id is required",
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
		await updateVideo({
			userId: authSession.userId,
			id: result.data.id,
			data: result.data,
		});

		return redirect(`/videos`, {
			headers: {
				"Set-Cookie": await commitAuthSession(request, { authSession }),
			},
		});
	}
};

export default function VideosPage() {
	const data = useLoaderData<typeof loader>();

	return (
		<>
			<Appbar title="Videos" />
			<Outlet />
			<ScrollArea className="w-full h-full">
				<HoverGrid>
					<Card>
						<CardTitle className="text-3xl">
							Create new video
						</CardTitle>
						<CardActions>
							<DialogDrawer
								trigger={
									<Button variant="outline">Create</Button>
								}
								title="Create Video"
							>
								<VideoForm isNewVideo />
							</DialogDrawer>
						</CardActions>
					</Card>
					{data.videos.map((video) => (
						<Card key={video.id}>
							<CardTitle>{video.title}</CardTitle>
							<CardDescription>
								{video.description}
							</CardDescription>
							<CardActions>
								<DialogDrawer
									trigger={
										<Button variant="outline">Edit</Button>
									}
									title="Video Details"
								>
									<VideoForm
										video={
											video as z.infer<typeof videoSchema>
										}
									/>
								</DialogDrawer>
							</CardActions>
						</Card>
					))}
				</HoverGrid>
			</ScrollArea>
		</>
	);
}

const VideoForm = ({
	video,
	isNewVideo = false,
}: {
	video?: z.infer<typeof videoSchema>;
	isNewVideo?: boolean;
}) => {
	const navigation = useNavigation();
	const disabled = isFormProcessing(navigation.state);
	return (
		<>
			<Form
				method="post"
				name="videoForm"
				className="grid items-start gap-4"
			>
				<div className="grid gap-2">
					<Label htmlFor="title">Video title</Label>
					<Input name="title" defaultValue={video?.title || ""} />
				</div>
				<div className="grid gap-2">
					<Label htmlFor="description">Description</Label>
					<Input
						name="description"
						defaultValue={video?.description || ""}
					/>
				</div>

				<input type="hidden" name="id" value={video?.id} />

				<div className="flex justify-end gap-2 w-full mt-8">
					{isNewVideo ? (
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
