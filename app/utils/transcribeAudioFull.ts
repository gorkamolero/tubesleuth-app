import { client } from "./assembly_ai.js";

export async function transcribeAudioFull({
	voiceoverUrl,
}: {
	voiceoverUrl: string;
}) {
	const config = {
		audio: voiceoverUrl,
	};

	try {
		const captions = await client.transcripts.transcribe(config);
		return captions;
	} catch (error) {
		console.error("Error in audio caption:", error);
	}
}

export default transcribeAudioFull;
