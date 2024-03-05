/*
pattern
string
Pattern for the animation. Must be comma-separated list of floats enclosed in curly braces.

animationLength
number [ 1 .. 6 ]
Duration of the animation. This controls how fast or slow the animation should be. For example, a value of 1 would create the fastest and 6 would create the slowest animations.

amplitudeX
number [ 0 .. 10 ]
Amount of motion in X axis.

amplitudeY
number [ 0 .. 10 ]
Amount of motion in Y axis.

amplitudeZ
number [ 0 .. 10 ]
Amount of motion in Z axis.

phaseX
number [ 0 .. 7 ]
The starting point or offset of the motion in the x-axis. For example, a phase value of 0 indicates that the motion starts from the origin.

phaseY
number [ 0 .. 7 ]
The starting point or offset of the motion in the Y-axis. For example, a phase value of 0 indicates that the motion starts from the origin.

phaseZ
number [ 0 .. 7 ]
The starting point or offset of the motion in the Z-axis. For example, a phase value of 0 indicates that the motion starts from the origin.

gain
number [ 0 .. 10 ]
Floating point gain value

convergence
number [ -1 .. 1 ]
A floating point number that specifies the convergence between -1 to 1.


Effects to achieve:
Horizontal
phaseX = 1, phaseY = 0, phaseZ = 0, amplitudeX = 0.0, amplitudeY = 0.25, amplitudeZ = 0.25

Circle
phaseX = 1, phaseY = 1, phaseZ = 0, amplitudeX = 0.0, amplitudeY = 0.25, amplitudeZ = 0.25   
        
Vertical
phaseX = 0, phaseY = 1, phaseZ = 0, amplitudeX = 0.0, amplitudeY = 0.25, amplitudeZ = 0.25    

Perspective
phaseX = 1, phaseY = 0.25, phaseZ = 1, amplitudeX = 0.0, amplitudeY = 0.25, amplitudeZ = 0.25
*/

import type { PREMIUM_FX } from "~/database/enums";

// Define the AnimationType with only the required properties for the effects
type AnimationType = {
	phaseX: number; // Range [0..7]
	phaseY: number; // Range [0..7]
	phaseZ: number; // Range [0..7]
	amplitudeX: number; // Range [0..10]
	amplitudeY: number; // Range [0..10]
	amplitudeZ: number; // Range [0..10]
	pattern?: string;
	animationLength?: number; // Range [1..6]
	gain?: number; // Range [0..10]
	convergence?: number; // Range [-1..1]
};

const amplitudeAmount = 1;
const phaseAmount = 2.5;

export interface Animation {
	title: string;
	description: string;
	key: string;
}

export const animations: Record<PREMIUM_FX, Animation> = {
	horizontal: {
		title: "Horizontal",
		description: "Horizontal motion",
		key: "horizontal",
	},
	vertical: {
		title: "Vertical",
		description: "Vertical motion",
		key: "vertical",
	},
	circle: {
		title: "Circle",
		description: "Circular motion",
		key: "circle",
	},
	perspective: {
		title: "Perspective",
		description: "Perspective motion",
		key: "perspective",
	},
	zoom: {
		title: "Zoom",
		description: "Zoom motion",
		key: "zoom",
	},
};

export type AnimationFX =
	| "horizontal"
	| "vertical"
	| "circle"
	| "perspective"
	| "zoom"
	| {
			phaseX: number;
			phaseY: number;
			phaseZ: number;
			amplitudeX: number;
			amplitudeY: number;
			amplitudeZ: number;
			gain?: number;
	  };

export const animationParameters = {
	horizontal: {
		phaseX: phaseAmount,
		phaseY: 0,
		phaseZ: 0,
		amplitudeX: amplitudeAmount,
		amplitudeY: 0.0,
		amplitudeZ: 0.0,
	},
	vertical: {
		phaseX: 0,
		phaseY: 2,
		phaseZ: 0,
		amplitudeX: 0.0,
		amplitudeY: 0.5,
		amplitudeZ: 0,
		gain: 0.3,
	},
	circle: {
		phaseX: 0,
		phaseY: 0.25,
		phaseZ: 0.25,
		amplitudeX: 0.25,
		amplitudeY: 0.25,
		amplitudeZ: 0,
		gain: 0.6,
	},
	perspective: {
		phaseX: 0,
		phaseY: 0.25,
		phaseZ: 0.25,
		amplitudeX: 0.1,
		amplitudeY: 0.05,
		amplitudeZ: 0.4,
		gain: 0.6,
	},
	zoom: {
		phaseX: 0,
		phaseY: 0,
		phaseZ: 4,
		amplitudeX: 0.0,
		amplitudeY: 0.0,
		amplitudeZ: 1.5,
	},
};
