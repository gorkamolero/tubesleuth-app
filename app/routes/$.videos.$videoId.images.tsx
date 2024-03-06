import { useState } from "react";

import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
	Form,
	Link,
	useFetcher,
	useLoaderData,
	useNavigate,
} from "@remix-run/react";
import { Activity, ArrowRight, SparklesIcon } from "lucide-react";

import { DialogDrawer } from "~/components/DialogDrawer";
import { LabelInputContainer } from "~/components/LabelInputContainer";
import { Button } from "~/components/ui/button";
import { Card, CardFooter } from "~/components/ui/card";
import { GradientSeparator } from "~/components/ui/gradient-separator";
import { Label } from "~/components/ui/label-gradient";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import Stepper from "~/components/ui/stepper";
import { Textarea } from "~/components/ui/textarea-gradient";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { TRANSITIONS } from "~/database/enums";
import { animationParameters } from "~/lib/animations";
import { capitalize, cn } from "~/lib/utils";
import { requireAuthSession } from "~/modules/auth";
import {
	generateImage,
	getImagesByVideoId,
	updateImage,
} from "~/modules/images/service.server";
import type { imageSchema } from "~/modules/images/service.server";
import { assertIsPost, isFormProcessing } from "~/utils";
import { animateImage } from "~/utils/animate";

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
	const intent = formData.get("intent") as string;

	const videoId = params.videoId;

	if (intent === "save") {
		const fx = (formData.get("fx") || "perspective") as string;
		const transition = (formData.get("transition") || "fade") as string;
		await updateImage({
			userId,
			id: imageId,
			data: { description, fx, transition },
		});
	} else if (intent === "generate") {
		await generateImage({ imageId, userId, description });
	} else if (intent === "animate") {
		await animateImage({ id: imageId, userId });
	}

	return redirect(`/videos/${videoId}/images`, {
		headers: {
			"Cache-Control": "no-cache",
		},
	});
};

export default function VideoImages() {
	const { images, videoId } = useLoaderData<{
		images: imageSchema[];
		videoId: string;
	}>();

	const navigate = useNavigate();

	if (images.length === 0) {
		return <div>No images found for this video.</div>;
	}

	const allImagesGenerated = images.every((image) => image.src);

	return (
		<>
			<DialogDrawer open fullScreen onClose={() => navigate("/videos/")}>
				<Stepper steps={8} currentStep={6} title="Generate images">
					{allImagesGenerated && (
						<Form method="post">
							<Button
								style={{ zoom: 1.2 }}
								name="intent"
								value="generateAll"
								type="submit"
								asChild
							>
								<Link to={`/videos/${videoId}/music`}>
									<ArrowRight className="mr-2" />
									<p>Generate Music</p>
								</Link>
							</Button>
						</Form>
					)}
				</Stepper>
				<div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
					{images.map((image) => (
						<ImageCard
							key={image.id}
							image={image as imageSchema}
						/>
					))}
				</div>
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
	const fetcher = useFetcher();

	const [description, setDescription] = useState(image.description || "");
	const [fx, setFx] = useState(image.fx || "");
	const [transition, setTransition] = useState(image.transition || "fade");

	const hasChangedDescription = description !== image.description;
	const hasChangedFx = fx !== image.fx;
	const hasChangedTransition = transition !== image.transition;

	const isDisabledSrc = image.src && !hasChangedDescription;
	const isDisabledAnim = image.animation && !hasChangedDescription;
	const isLoading = isFormProcessing(fetcher.state);
	const disabledSrc = !!(isDisabledSrc || isLoading);
	const disabledAnim = !!(isDisabledAnim || isLoading);

	const canSave =
		hasChangedDescription || hasChangedFx || hasChangedTransition;

	return (
		<Card>
			<fetcher.Form name="generateImage" method="post">
				<input type="hidden" name="imageId" value={image.id} />
				{image.animation ? (
					<div
						className="h-[1920] w-[1080]"
						style={{ aspectRatio: "9 / 16" }}
					>
						<video className="size-full" controls loop>
							<source src={image.animation} type="video/mp4" />
							Your browser does not support the video tag.
						</video>
					</div>
				) : image.src ? (
					<img
						src={image.src}
						alt={image.description || "Image"}
						className="h-auto w-full object-cover"
						style={{ aspectRatio: "9 / 16" }}
					/>
				) : (
					<div
						className="bg-zinc/80 flex w-full items-center justify-center"
						style={{ aspectRatio: "9 / 16" }}
					>
						{isLoading ? (
							<LoadingSpinner className="size-12" />
						) : (
							<span className="text-gray-500">
								No image found
							</span>
						)}
					</div>
				)}

				<LabelInputContainer className="p-4">
					<Label htmlFor="description" className="mb-2 block">
						Description
					</Label>
					<Textarea
						name="description"
						id="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="h-32 text-sm"
						cols={160}
					/>
				</LabelInputContainer>

				<LabelInputContainer
					className={cn("p-4", image?.src || "hidden")}
				>
					<Label htmlFor="animation" className="mb-2 block">
						Animation. Refer to{" "}
						<Link className="underline" to="/animations">
							these
						</Link>
					</Label>
					<Select name="fx" defaultValue={fx} onValueChange={setFx}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select animation" />
						</SelectTrigger>
						<SelectContent>
							{Object.keys(animationParameters).map((key) => (
								<SelectItem key={key} value={key}>
									{capitalize(key)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</LabelInputContainer>

				<LabelInputContainer
					className={cn("p-4", image?.src || "hidden")}
				>
					<Label htmlFor="transition" className="mb-2 block">
						Transition
					</Label>
					<Select
						name="transition"
						defaultValue={transition}
						onValueChange={setTransition}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select transition" />
						</SelectTrigger>
						<SelectContent>
							{Object.values(TRANSITIONS).map((transition) => (
								<SelectItem key={transition} value={transition}>
									{capitalize(transition)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</LabelInputContainer>

				<CardFooter className="pt-4">
					<div className="grid w-full gap-2">
						<div className="flex flex-wrap justify-end gap-2">
							<Button
								disabled={disabledSrc}
								size="sm"
								type="submit"
								className="cursor-pointer"
								name="intent"
								value="generate"
							>
								<div className="mr-2">
									{isLoading ? (
										<LoadingSpinner />
									) : (
										<SparklesIcon className="size-4" />
									)}
								</div>
								Generate
							</Button>

							<Button
								disabled={disabledAnim}
								size="sm"
								variant="outline"
								type="submit"
								name="intent"
								value="animate"
							>
								{isLoading ? (
									<LoadingSpinner />
								) : (
									<Activity className="mr-2 size-4" />
								)}
								Animate
							</Button>
						</div>

						<GradientSeparator />

						<div
							className={cn(
								"flex justify-end gap-2",
								image?.src || "hidden",
							)}
						>
							<Button
								disabled={!canSave}
								size="sm"
								variant="outline"
								type="submit"
								name="intent"
								value="save"
							>
								Save
							</Button>
						</div>
					</div>
				</CardFooter>
			</fetcher.Form>
		</Card>
	);
};
