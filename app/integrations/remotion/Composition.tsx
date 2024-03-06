import React from "react";

import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Img, useCurrentFrame, AbsoluteFill, Audio, Video } from "remotion";

import { TranscriptionCaptions } from "./TranscriptionCaptions";
import type { FX } from "../../database/enums";
import { generateEffectFilter, getDurationInFrames } from "../../lib/utils";
import type { imageSchema } from "../../modules/images";

export interface CompositionProps {
	fps: number;
	subtitles: any;
	music: string;
	images: imageSchema[];
}

export interface TubesleuthProps
	extends CompositionProps,
		Record<string, unknown> {}

export const Tubesleuth: React.FC<TubesleuthProps> = ({
	fps,
	subtitles,
	images,
	music,
	voiceover,
}) => {
	let accumulatedFrames = 0;
	const currentFrame = useCurrentFrame();
	return (
		<>
			<TransitionSeries>
				{images.map((image, index) => {
					if (!image?.src && !image?.animation) return null;

					const isLastImage = index === images.length - 1;

					const durationInFrames = getDurationInFrames(
						image,
						fps,
						isLastImage,
					);

					const from = accumulatedFrames;

					const { transform } = generateEffectFilter({
						effect: image?.fx as FX,
						currentFrame,
						from,
						durationInFrames,
					});

					accumulatedFrames += durationInFrames - fps;

					return (
						<>
							<TransitionSeries.Sequence
								durationInFrames={durationInFrames}
							>
								{image?.animation ? (
									<Video src={image?.animation} loop />
								) : (
									<Img
										src={image?.src || ""}
										style={{
											transform,
										}}
									/>
								)}
							</TransitionSeries.Sequence>
							<TransitionSeries.Transition
								presentation={fade()}
								timing={linearTiming({ durationInFrames: 30 })}
							/>
						</>
					);
				})}
			</TransitionSeries>

			<AbsoluteFill>
				<Audio src={voiceover as string} />
				<Audio
					src={
						music ||
						"https://ezamdwrrzqrnyewhqdup.supabase.co/storage/v1/object/public/assets/deep.mp3"
					}
					volume={0.2}
				/>
			</AbsoluteFill>

			<TranscriptionCaptions subtitles={subtitles} fps={fps} />
		</>
	);
};
