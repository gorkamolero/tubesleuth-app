import React from "react";
import { Composition } from "remotion";
import { Tubesleuth, TubesleuthProps } from "./Composition";
import mockData from "./mockData";
import { FPS, height, width } from "../../lib/constants";
import { convertSecondsToFrames } from "../../lib/utils";

export const RemotionRoot: React.FC = () => {
	const duration = convertSecondsToFrames(
		Math.min(mockData.duration, 60),
		FPS,
	);
	const randomId = "mon-4-mar";
	return (
		<>
			<Composition
				component={Tubesleuth}
				durationInFrames={duration}
				width={width}
				height={height}
				fps={FPS}
				id={randomId}
				defaultProps={mockData as any as TubesleuthProps}
			/>
		</>
	);
};
