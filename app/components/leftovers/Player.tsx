import React, { useState, useEffect } from "react";

interface PlayerProps {
	src: string; // The URL of the audio track
}

export const Player: React.FC<PlayerProps> = ({ src }) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [loadError, setLoadError] = useState(false);

	useEffect(() => {
		const audio = new Audio();
		audio.src = src;
		audio.load();

		// Event listener for successful audio loading
		audio.onloadeddata = () => {
			setLoadError(false);
			if (isPlaying) {
				audio.play().catch((e) => console.error("Playback failed:", e));
			}
		};

		// Error handling for issues loading the audio
		audio.onerror = (e) => {
			console.error("Error loading audio:", e);
			setLoadError(true);
		};

		// Play or pause the audio based on isPlaying state
		const togglePlayPause = () => {
			setIsPlaying(!isPlaying);
			if (!isPlaying) {
				audio.play().catch((e) => console.error("Playback failed:", e));
			} else {
				audio.pause();
			}
		};

		// Cleanup function to pause audio on component unmount
		return () => {
			audio.pause();
		};
	}, [src, isPlaying]);

	if (loadError) {
		return <div>Error loading audio. Please check the source URL.</div>;
	}

	return (
		<div>
			<button onClick={() => setIsPlaying(!isPlaying)}>
				{isPlaying ? "Pause" : "Play"}
			</button>
		</div>
	);
};

export default Player;
