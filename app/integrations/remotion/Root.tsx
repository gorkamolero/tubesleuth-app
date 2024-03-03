import React from "react";
import { Composition } from "remotion";
import { Tubesleuth, TubesleuthProps } from "./Composition";
import mockData from "./mockData";
import { FPS, height, width } from "../../lib/constants";

export const RemotionRoot: React.FC = () => {
	const duration = Math.min(mockData.transcript.audio_duration + 2, 60) * FPS;
	return (
		<>
			<Composition
				component={Tubesleuth}
				durationInFrames={duration}
				width={width}
				height={height}
				fps={FPS}
				id="tubesleuth"
				defaultProps={mockData as any as TubesleuthProps}
			/>
		</>
	);
};
