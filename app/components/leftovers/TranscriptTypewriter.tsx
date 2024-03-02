import React, { useEffect, useState } from "react";
import {
	TypewriterEffect,
	TypewriterEffectSmooth,
} from "~/components/ui/typewriter"; // Ensure this path is correct

interface Segment {
	start: number;
	end: number;
	text: string;
}

interface Props {
	transcript: {
		segments: Segment[];
	};
}

const TranscriptTypewriter: React.FC<Props> = ({ transcript }) => {
	// Transform the transcript segments into the format expected by TypewriterEffect
	const [currentSegment, setCurrentSegment] = useState<{ text: string }[]>(
		[],
	);
	const [segmentIndex, setSegmentIndex] = useState(0);

	useEffect(() => {
		let timeoutId: NodeJS.Timeout | null = null;

		const displaySegment = (index: number) => {
			if (index >= transcript.segments.length) return;

			const segment = transcript.segments[index];
			const words = segment.text
				.trim()
				.split(/\s+/)
				.map((word) => ({ text: word }));
			setCurrentSegment(words);
			setSegmentIndex(index);

			// Calculate the time until the next segment starts
			const nextSegment = transcript.segments[index + 1];
			const delay = nextSegment
				? (nextSegment.start - segment.start) * 1000
				: segment.end * 1000;

			// Schedule the next update
			timeoutId = setTimeout(() => displaySegment(index + 1), delay);
		};

		displaySegment(0);

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [transcript.segments]);

	return (
		<div>
			<TypewriterEffectSmooth
				key={segmentIndex}
				words={currentSegment}
				cursorClassName="your-cursor-class" // Customize as needed
			/>
		</div>
	);
};

export default TranscriptTypewriter;
