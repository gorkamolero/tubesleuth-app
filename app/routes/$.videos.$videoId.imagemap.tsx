import { useState } from "react";

import type { LoaderFunctionArgs, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
	Form,
	Link,
	useLoaderData,
	useNavigate,
	useNavigation,
} from "@remix-run/react";
import { LucidePlus, LucideX, Sparkles } from "lucide-react";
import { redirectWithSuccess } from "remix-toast";
import { toast } from "sonner";

import { DialogDrawer } from "~/components/DialogDrawer";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { Separator } from "~/components/ui/separator";
import Stepper from "~/components/ui/stepper";
import { requireAuthSession } from "~/modules/auth";
import type { imageSchema } from "~/modules/images";
import { createManyImages } from "~/modules/images";
import type { vidSchema } from "~/modules/videos";
import { getVideoWithImages } from "~/modules/videos";
import { assertIsPost, getRequiredParam, isFormProcessing } from "~/utils";

export async function loader({ params }: LoaderFunctionArgs) {
	const videoId = getRequiredParam(params, "videoId");

	const video = (await getVideoWithImages({ id: videoId })) as vidSchema & {
		images?: imageSchema[] | null | undefined;
	};
	if (!video) {
		throw new Response("Not Found", { status: 404 });
	}

	const imagesGenerated =
		video.images && video.images.some((image) => image.src !== null);

	if (imagesGenerated) {
		return redirectWithSuccess(
			`/videos/${videoId}/images`,
			"Image map generated!",
		);
	}

	return json({
		video,
	});
}

export const action: ActionFunction = async ({ request }) => {
	assertIsPost(request);
	const { userId } = await requireAuthSession(request);
	const formData = await request.formData();
	const descriptions = formData.getAll("imageMap[]").map(String);
	const videoId = formData.get("videoId") as string;

	await createManyImages({ descriptions, userId, videoId });

	return redirect(`/videos/${videoId}/images`);
};

export default function ImagesDescriptionPage() {
	const { video } = useLoaderData<typeof loader>();
	if (!video) throw new Error("Video not found");

	const hasImages = video.images && video.images.length > 0;

	const navigation = useNavigation();
	const disabled = isFormProcessing(navigation.state);
	const [imageFields, setImageFields] = useState<string[]>([""]);

	const addImageField = (index: number) => {
		const newImageFields = [...imageFields];
		newImageFields.splice(index + 1, 0, "");
		setImageFields(newImageFields);
	};
	const removeImageField = (index: number) =>
		setImageFields(imageFields.filter((_, i) => i !== index));

	const hasNoImages = imageFields.length < 1;

	const navigate = useNavigate();

	return (
		<DialogDrawer open fullScreen onClose={() => navigate("/videos/")}>
			<Stepper steps={8} currentStep={5} title="Add images" />
			<div className="flex size-full items-start space-x-8">
				<div className="flex h-full w-1/2 flex-col items-center justify-center">
					<Card className="max-w-md">
						<CardHeader>
							<CardTitle>{video.title}</CardTitle>

							<CardDescription>
								{video.description}
							</CardDescription>
						</CardHeader>
						<CardContent>{video.script}</CardContent>
					</Card>
				</div>
				<div className="w-2/2 flex h-full flex-col items-center justify-center">
					<Form
						method="post"
						name="generate-images"
						className="w-full space-y-6"
					>
						<div className="flex flex-col space-y-4">
							<h2 className="text-2xl font-bold">Add Images</h2>
							<p className="text-sm">
								Or remove the image and click "Auto-generate" to
								let the AI do it for you
							</p>
							<input
								type="hidden"
								name="videoId"
								value={video.id}
							/>
							{imageFields.map((_, index) => (
								<div
									key={index}
									className="flex w-full items-center justify-between space-x-4"
								>
									{hasNoImages && (
										<div className="h-10 grow">
											&nbsp;
										</div>
									)}
									<Input
										type="text"
										name="imageMap[]"
										placeholder="Add an image"
										className="grow"
									/>
									<div className="flex items-center">
										<Button
											type="button"
											onClick={() => addImageField(index)}
											className="mr-4"
										>
											<LucidePlus />
										</Button>
										<Button
											type="button"
											variant="outline"
											onClick={() =>
												removeImageField(index)
											}
										>
											<LucideX />
										</Button>
									</div>
								</div>
							))}
						</div>
						<Separator />
						<div className="flex justify-end space-x-2">
							{hasNoImages && (
								<Button
									variant="outline"
									// onclick add one empty
									onClick={() =>
										addImageField(imageFields.length - 1)
									}
								>
									Add manually
								</Button>
							)}
							<Button
								type="submit"
								name="generate-images"
								disabled={disabled}
								size="lg"
								onClick={() => {
									toast.info(
										"Generating image map. This could take a while...",
									);
								}}
							>
								<div className="flex items-center gap-2">
									{disabled ? (
										<LoadingSpinner />
									) : (
										<Sparkles />
									)}
									{hasNoImages ? "Auto-generate" : "Generate"}
								</div>
							</Button>
							{hasImages && (
								<Button asChild variant="outline">
									<Link to={`/videos/${video.id}/images`}>
										Continue
									</Link>
								</Button>
							)}
						</div>
					</Form>
				</div>
			</div>
		</DialogDrawer>
	);
}
