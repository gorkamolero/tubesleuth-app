import { VOICEMODELS } from "~/database/enums";
import openai from "./openai";

export async function createVoiceover({
	script,
	model,
}: {
	script: string;
	model: VOICEMODELS;
}) {
	try {
		// Perform text-to-speech conversion
		const mp3Response = await openai.audio.speech.create({
			model: "tts-1",
			voice: model,
			input: script,
		});

		const arrayBuffer = await mp3Response.arrayBuffer();

		const buffer = Buffer.from(arrayBuffer);

		return buffer;
	} catch (error) {
		console.error("Error in text-to-speech conversion:", error);

		throw error;
	}

	// TODO: If duration is too long, redo script
}

export default createVoiceover;
