import React from "react";

import { Img, useCurrentFrame, AbsoluteFill, Audio } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { imageSchema } from "../../modules/images";
import { generateEffectFilter, getDurationInFrames } from "../../lib/utils";
import { FX } from "~/database/enums";
import { TranscriptionCaptions } from "./TranscriptionCaptions";

const yes25percentOfTheTime = Math.random() > 0.75;

export interface CompositionProps {
	videoId: string;
	fps: number;
	script: string;
	transcript: any;
	mood: string;
	images: imageSchema[];
}

export interface TubesleuthProps
	extends CompositionProps,
		Record<string, unknown> {}

export const Tubesleuth: React.FC<TubesleuthProps> = ({
	videoId,
	fps,
	script,
	transcript,
	images,
	mood,
	voiceover,
}) => {
	let accumulatedFrames = 0;
	const currentFrame = useCurrentFrame();
	return (
		<>
			<TransitionSeries>
				{images.map((image, index) => {
					if (!image?.src) return null;

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
								<Img
									src={image?.src}
									style={{
										transform,
									}}
								/>
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
					src="https://ezamdwrrzqrnyewhqdup.supabase.co/storage/v1/object/public/assets/deep.mp3"
					volume={0.2}
				/>
			</AbsoluteFill>

			{/* <TranscriptionCaptions /> */}
		</>
	);
};
