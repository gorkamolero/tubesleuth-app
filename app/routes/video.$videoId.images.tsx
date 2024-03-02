import {
	ActionFunction,
	json,
	LoaderFunction,
	redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
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
import { Textarea } from "~/components/ui/textarea";

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
	return json({ images });
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

	return redirect(`/video/${videoId}/images`);
};

export default function VideoImages() {
	const { images } = useLoaderData<{ images: imageSchema[] }>();

	if (images.length === 0) {
		return <div>No images found for this video.</div>;
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
			{images.map((image) => {
				return (
					<ImageCard key={image.id} image={image as imageSchema} />
				);
			})}

			<Button className="fixed bottom-4 right-4">
				<SparklesIcon className="mr-2" />
				Generate all
			</Button>
		</div>
	);
}

const ImageCard = ({ image }: { image: imageSchema }) => {
	const navigation = useNavigation();
	const disabled = isFormProcessing(navigation.state);
	const [description, setDescription] = useState(image.description || "");
	const hasEdited = description !== image.description;

	return (
		<Card>
			<Form name="generateImage" method="post">
				<input type="hidden" name="imageId" value={image.id} />
				{image.src ? (
					<img
						src={image.src}
						alt={image.description || "Image"}
						className="w-full h-auto object-cover"
						style={{ aspectRatio: "9 / 16" }} // Ensuring the image maintains a 9:16 aspect ratio
					/>
				) : (
					<div
						className="w-full bg-gray-300 flex items-center justify-center"
						style={{ paddingTop: "177.77%" }} // Placeholder maintaining a 9:16 aspect ratio
					>
						<span className="text-gray-500">No Image</span>
					</div>
				)}

				<Textarea
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
								disabled={
									(disabled || !hasEdited) &&
									image.src !== null
								}
								size="sm"
								type="submit"
								className="cursor-pointer"
							>
								<SparklesIcon className="h-4 w-4 mr-2" />
								Generate
							</Button>
						</div>
					</div>
				</CardFooter>
			</Form>
		</Card>
	);
};
