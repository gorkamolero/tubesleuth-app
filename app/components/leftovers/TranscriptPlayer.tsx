import { useEffect, useRef, useState } from "react";

import { AudioPlayer } from "./AudioPlayer";

interface TranscriptPlayerProps {
	title: string;
	description: string;
	src: string;
}

export const TranscriptPlayer: React.FC<TranscriptPlayerProps> = ({
	title = "Roxette",
	description = "Listen to your heart",
	src = "https://audioplayer.madza.dev/Madza-Chords_of_Life.mp3",
}) => {
	const ref = useRef<HTMLAudioElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState(0);

	const togglePlayPause = () => {
		setIsPlaying(!isPlaying);
	};

	useEffect(() => {
		const audio = ref.current;
		if (!audio) return;

		const updateProgress = () => {
			const currentTime = audio.currentTime;
			const duration = audio.duration;
			setProgress((currentTime / duration) * 100);
		};

		if (isPlaying) {
			audio.play();
		} else {
			audio.pause();
		}

		audio.addEventListener("timeupdate", updateProgress);

		return () => audio.removeEventListener("timeupdate", updateProgress);
	}, [isPlaying]);

	// Adjusts the audio's current time based on the new progress value
	const handleTimeUpdate = (newProgress: number) => {
		const audio = ref.current;
		if (audio) {
			const newTime = (newProgress / 100) * audio.duration;
			audio.currentTime = newTime;
			setProgress(newProgress); // Update progress state if needed
		}
	};

	return (
		<>
			<AudioPlayer
				title={title}
				description={description}
				onClick={togglePlayPause}
				isPlaying={isPlaying}
				progress={progress}
				onChangeProgress={handleTimeUpdate}
			/>
			<audio ref={ref} crossOrigin="anonymous" src={src} />
		</>
	);
};
