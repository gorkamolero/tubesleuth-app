import {
	ActionFunction,
	json,
	LoaderFunction,
	redirect,
} from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";
import {
	generateImage,
	getImagesByVideoId,
} from "~/modules/images/service.server";
import { requireAuthSession } from "~/modules/auth";

import { imageSchema } from "~/modules/images/service.server";
import { Button } from "~/components/ui/button";
import { SparklesIcon } from "lucide-react";
import { Card, CardFooter } from "~/components/ui/card";
import { assertIsPost, isFormProcessing } from "~/utils";
import { useState } from "react";
import { Textarea } from "~/components/ui/textarea-gradient";
import { DialogDrawer } from "~/components/DialogDrawer";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import Stepper from "~/components/ui/stepper";
import { LoadingSpinner } from "~/components/ui/loading-spinner";

export const loader: LoaderFunction = async ({ params, request }) => {
	const { userId } = await requireAuthSession(request);
	const videoId = params.videoId;
	if (!videoId) throw new Error("Video ID is required");

	const unsorted = await getImagesByVideoId({ videoId, userId });
	const images = unsorted
		.filter((a) => a.start !== undefined)
		.map((image) => ({
			...image,
		}))
		.sort((a, b) => a.start! - b.start!);
	return json({ images, videoId });
};

export const action: ActionFunction = async ({ params, request }) => {
	assertIsPost(request);
	const { userId } = await requireAuthSession(request);
	const formData = await request.formData();
	const imageId = formData.get("imageId") as string;
	const description = formData.get("description") as string;

	const videoId = params.videoId;

	await generateImage({
		imageId,
		userId,
		description,
	});

	return redirect(`/videos/${videoId}/images`);
};

export default function VideoImages() {
	const { images, videoId } = useLoaderData<{
		images: imageSchema[];
		videoId: string;
	}>();

	if (images.length === 0) {
		return <div>No images found for this video.</div>;
	}

	const allImagesGenerated = images.every((image) => image.src);

	return (
		<>
			<DialogDrawer open fullScreen>
				<Stepper steps={8} currentStep={6} title="Generate images" />
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
					{images.map((image) => {
						return (
							<ImageCard
								key={image.id}
								image={image as imageSchema}
							/>
						);
					})}
				</div>
				{allImagesGenerated && (
					<div className="fixed bottom-0 right-0 p-6">
						<Button size="lg" asChild style={{ zoom: 1.2 }}>
							<Link to={`/videos/${videoId}/music`}>
								<p className="text-md">Choose music</p>
							</Link>
						</Button>
					</div>
				)}
			</DialogDrawer>

			<Tooltip>
				<TooltipTrigger asChild>
					<Button className="fixed bottom-4 right-4">
						<SparklesIcon className="mr-2" />
						Generate all
					</Button>
				</TooltipTrigger>
				<TooltipContent>Coming soon!</TooltipContent>
			</Tooltip>
		</>
	);
}

const ImageCard = ({ image }: { image: imageSchema }) => {
	const navigation = useNavigation();
	const disabled = isFormProcessing(navigation.state);
	const [description, setDescription] = useState(image.description || "");

	return (
		<Card>
			<Form name="generateImage" method="post">
				<input type="hidden" name="imageId" value={image.id} />
				{image.src ? (
					<img
						src={image.src}
						alt={image.description || "Image"}
						className="w-full h-auto object-cover"
						style={{ aspectRatio: "9 / 16" }}
					/>
				) : (
					<div
						className="w-full bg-zinc/80 flex items-center justify-center"
						style={{ aspectRatio: "9 / 16" }}
					>
						{disabled ? (
							<LoadingSpinner className="h-12 w-12" />
						) : (
							<span className="text-gray-500">
								No image found
							</span>
						)}
					</div>
				)}

				<Textarea
					disabled={disabled}
					name="description"
					id="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className="h-32 text-sm"
					cols={160}
				/>

				<CardFooter className="pt-4">
					<div className="flex flex-1 justify-between items-baseline">
						{image.start !== undefined && (
							<p className="text-xs">
								@{(image.start! / 1000).toFixed(2)}s
							</p>
						)}
						<div className="flex justify-end space-x-2">
							<Button
								disabled={disabled}
								size="sm"
								type="submit"
								className="cursor-pointer"
							>
								<div className="mr-2">
									{disabled ? (
										<LoadingSpinner />
									) : (
										<SparklesIcon className="h-4 w-4" />
									)}
								</div>
								Generate
							</Button>
						</div>
					</div>
				</CardFooter>
			</Form>
		</Card>
	);
};
