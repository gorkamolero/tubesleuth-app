import openai from "./openai";
import { Uploadable } from "openai/uploads";

type Transcription = {
	duration: number;
	language: string;
	text: string;
	segments: Array<{
		id: string;
		start: number;
		end: number;
		text: string;
	}>;
};

export const remapTranscript = (transcript: Transcription) => {
	return {
		duration: transcript.duration,
		language: transcript.language,
		text: transcript.text,
		segments: transcript.segments.map((segment) => ({
			id: segment.id,
			start: segment.start,
			end: segment.end,
			text: segment.text,
		})),
	};
};

export async function transcribeAudio({
	file,
}: {
	// it's an mp3 file
	file: Uploadable;
}) {
	try {
		// Create a transcription request
		const transcript = await openai.audio.transcriptions.create({
			model: "whisper-1",
			file,
			response_format: "verbose_json",
		});

		const remappedTranscript = remapTranscript(transcript as Transcription);

		return remappedTranscript;
	} catch (error) {
		console.error("Error in audio transcription:", error);
	}
}
