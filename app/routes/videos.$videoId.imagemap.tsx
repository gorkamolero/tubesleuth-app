import type { LoaderFunctionArgs, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
	Form,
	useLoaderData,
	useNavigate,
	useNavigation,
} from "@remix-run/react";
import { LucidePlus, LucideX, Sparkles } from "lucide-react";
import { useState } from "react";
import { redirectWithSuccess } from "remix-toast";
import { toast } from "sonner";
import { DialogDrawer } from "~/components/DialogDrawer";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { Separator } from "~/components/ui/separator";
import Stepper from "~/components/ui/stepper";

import { requireAuthSession } from "~/modules/auth";
import { createManyImages, imageSchema } from "~/modules/images";
import { getVideo, getVideoWithImages, vidSchema } from "~/modules/videos";
import { assertIsPost, getRequiredParam, isFormProcessing } from "~/utils";

export async function loader({ params }: LoaderFunctionArgs) {
	const videoId = getRequiredParam(params, "videoId");

	const video = (await getVideoWithImages({ id: videoId })) as vidSchema & {
		images: imageSchema[];
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
			<div className="flex w-full">
				<div className="w-1/3 flex flex-col items-center justify-center">
					<div className="space-y-6 w-full max-w-md">
						<h1 className="text-3xl font-bold">{video.title}</h1>
						<p>{video.description}</p>
						<p>{video.script}</p>
					</div>
				</div>
				<div className="w-2/3 flex flex-col items-center justify-center">
					<Form
						method="post"
						name="generate-images"
						className="space-y-6 w-full max-w-md"
					>
						<input type="hidden" name="videoId" value={video.id} />

						<div className="flex flex-col space-y-4">
							<h2 className="text-2xl font-bold">Add Images</h2>
							<p className="text-sm">
								Or remove the image and click "Auto-generate" to
								let the AI do it for you
							</p>
							{imageFields.map((_, index) => (
								<div
									key={index}
									className="flex justify-between items-center space-x-4 w-full"
								>
									{hasNoImages && (
										<div className="h-10 flex-grow">
											&nbsp;
										</div>
									)}
									<Input
										type="text"
										name="imageMap[]"
										placeholder="Add an image"
										className="flex-grow"
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
									toast.info("Generating image map...");
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
						</div>
					</Form>
				</div>
			</div>
		</DialogDrawer>
	);
}
