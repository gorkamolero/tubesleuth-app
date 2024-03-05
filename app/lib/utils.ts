import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import mockData from "../integrations/remotion/mockData";
import { imageSchema } from "~/modules/images";
import { getInputProps } from "remotion";
import { moveAbout } from "./effects/moveAbout";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const capitalize = (s: string) => {
	return s.charAt(0).toUpperCase() + s.slice(1);
};

export const convertSecondsToFrames = (seconds: number, fps: number) => {
	return seconds * fps;
};

export function generateEffectFilter({
	effect,
	currentFrame,
	from,
	durationInFrames,
}: {
	effect: string;
	currentFrame: number;
	from: number;
	durationInFrames: number;
}) {
	let transform = "";

	const progress = Math.max(
		0,
		Math.min(1, (currentFrame - from) / durationInFrames),
	); // Ensures progress is between 0 and 1

	switch (effect) {
		case "perspective":
		case "horizontal":
		case "vertical":
		case "circle":
		case "zoom":
		case "ZoomIn":
			transform = `scale(${Math.min(1.1, 1 + progress * 0.1)})`; // Caps the maximum scale at 1.1
			break;
		case "ZoomOut":
			transform = `scale(${Math.max(1, 1.1 - progress * 0.1)})`; // Ensures scale does not go below 1
			break;
		case "PanLeft":
		case "PanRight":
			const translateX = Math.min(10, progress * 10); // Caps the maximum translateX at 10%
			transform = `translateX(${
				effect === "PanLeft" ? -translateX : translateX
			}%) scale(1.2)`;
			break;
		case "PanUp":
		case "PanDown":
			const translateY = Math.min(10, progress * 10); // Caps the maximum translateY at 10%
			transform = `translateY(${
				effect === "PanUp" ? -translateY : translateY
			}%) scale(1.2)`;
			break;
		default:
			transform = "scale(1)";
	}

	return {
		transform,
	};
}

export const getDurationInFrames = (
	image: imageSchema,
	fps: number,
	isLast: boolean,
) => {
	const start = image.start! / 1000;
	const end = isLast ? image.end! + 2 / 1000 : image.end! / 1000;
	return Math.round((end - start) * fps) + fps;
};

export function convertMsToFrames(ms: number, fps: number) {
	return Math.round((ms / 1000) * fps);
}

export const getFullInputProps = () => {
	let inputProps: any = getInputProps();
	if (inputProps && Object.keys(inputProps).length) {
		return inputProps;
	}
	return mockData;
};
