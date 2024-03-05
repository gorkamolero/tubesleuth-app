"use client";

import { useState, useRef } from "react";

import type { LucideProps } from "lucide-react";
import { Pause } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
	CardTitle,
	CardDescription,
	CardHeader,
	CardContent,
	Card,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { RadioGroupItem, RadioGroup } from "~/components/ui/radio-group";

export interface Track {
	name: string;
	title: string;
	src: string;
	forceValue?: string;
}

interface TrackItemProps {
	track: Track;
	index: number;
}

const mockData: Track[] = [
	{
		name: "track1", // Added name field
		title: "Track 1",
		src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
	},
	{
		name: "track2", // Added name field
		title: "Track 2",
		src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
	},
	{
		name: "track3", // Added name field
		title: "Track 3",
		src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
	},
	{
		name: "track4", // Added name field
		title: "Track 4",
		src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
	},
	{
		name: "track5", // Added name field
		title: "Track 5",
		src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
	},
];

interface AudioSelectorProps {
	title?: string;
	description?: string;
	name: string;
	tracks: Track[];
}

export const AudioSelector = ({
	title = "Select Your Favorite Track",
	description = "Click the play button to listen to the track and select your favorite.",
	tracks = mockData,
	name,
}: AudioSelectorProps) => (
		<Card>
			<CardHeader className="pb-0">
				<CardTitle className="text-2xl">{title}</CardTitle>
				<CardDescription className="text-gray-500">
					{description}
				</CardDescription>
			</CardHeader>
			<CardContent className="p-0">
				<div className="grid gap-2 p-4">
					<RadioGroup name={name}>
						{tracks.map((track, index) => (
							<TrackItem
								key={track.name}
								track={track}
								index={index}
							/>
						))}
					</RadioGroup>
				</div>
			</CardContent>
		</Card>
	);

export const TrackItem: React.FC<TrackItemProps> = ({ track, index }) => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);

	const togglePlay = () => {
		const audio = audioRef.current;
		if (!audio) return;

		if (audio.paused) {
			audio.play();
			setIsPlaying(true);
		} else {
			audio.pause();
			setIsPlaying(false);
		}
	};

	return (
		<div className="flex items-center gap-4">
			<Button
				aria-label="Play"
				size="icon"
				onClick={togglePlay}
				type="button"
			>
				{isPlaying ? <Pause /> : <PlayIcon />}
			</Button>
			<audio ref={audioRef} src={track.src} className="hidden" />
			<RadioGroupItem
				className="peer sr-only"
				id={track.name}
				value={track.forceValue ? track.forceValue : track.name}
			/>
			<Label
				className="grid flex-1 cursor-pointer gap-1 rounded-lg p-4 text-sm transition-colors peer-aria-checked:border-2"
				htmlFor={track.name}
			>
				<div className="font-medium">{track.title}</div>
			</Label>
		</div>
	);
};

function PlayIcon(props: LucideProps) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<polygon points="5 3 19 12 5 21 5 3" />
		</svg>
	);
}
