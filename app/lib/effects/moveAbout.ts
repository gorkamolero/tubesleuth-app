import { noise } from "./noise";

const FREQUENCY = 1.6;
const MOVEMENT_AMPLITUDE = 400; // Adjusted for noticeable but constrained movement
const ZOOM_AMPLITUDE = 0.5; // For subtle zoom effect
const SPEED_MULTIPLIER = 1.1; // Adjust for overall speed
const MIN_SCALE = 1.2; // Minimum zoom level
const MAX_SCALE = 1.5; // Maximum zoom level

export const moveAbout = (
	currentFrame: number,
	from: number,
	durationInFrames: number,
) => {
	const progress =
		((currentFrame - from) % durationInFrames) / durationInFrames;
	const scaledProgress = progress * SPEED_MULTIPLIER;

	// Noise value for scale calculation
	const baseNoiseValue = noise(scaledProgress * FREQUENCY);
	// Calculate scale within specified range
	const scale =
		MIN_SCALE + baseNoiseValue * ZOOM_AMPLITUDE * (MAX_SCALE - MIN_SCALE);

	// Adjust movement amplitude based on scale to ensure visibility within bounds
	const effectiveAmplitude = MOVEMENT_AMPLITUDE * (1 / scale);

	let x = (noise(scaledProgress * FREQUENCY) - 0.5) * effectiveAmplitude;
	let y =
		(noise(scaledProgress * FREQUENCY + 500) - 0.5) * effectiveAmplitude;

	return { x, y, scale };
};
