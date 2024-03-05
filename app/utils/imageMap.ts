import { getSupabaseAdmin, supabaseClient } from "~/integrations/supabase";
import { promptAssistant } from "./openai";
import { updateVideo } from "~/modules/videos";
import { z } from "zod";

export const replacer = (key: string, value: any) => {
	if (typeof value === "string") {
		return encodeURIComponent(value);
	}
	return value;
};

const imageMapSchema = z.array(
	z.object({
		description: z.string(),
		start: z.number(),
		end: z.number(),
	}),
);

export const generateImageMap = async ({
	userId,
	videoId,
	descriptions,
	imageStyle,
	script,
	transcript,
}: {
	userId: string;
	videoId: string;
	descriptions: string[];
	imageStyle: string;
	script: string;
	transcript: any;
}): Promise<z.infer<typeof imageMapSchema>> => {
	// autogenerate if array has only empty values or values with no length or if non existeng
	const autoGenerate =
		descriptions.every(
			(description) => !description || !description.length,
		) || !descriptions.length;

	const timedScript = JSON.stringify(
		transcript.words.map(
			(w: { text: string; start: number; end: number }) => ({
				word: w.text,
				start: w.start,
				end: w.end,
			}),
		),
		replacer,
	);

	const instructions = autoGenerate
		? "Please read this full script, propose beautiful imagery and map images to the timings provided."
		: "Please map the images provided to the script's key moments of this script. If there are not enough, propose until reaching six or seven and cover full duration";

	const prompt = `${instructions}: 
---
${
	autoGenerate
		? ""
		: descriptions
				.map((image, index) => `Image ${index + 1}: ${image}`)
				.join("\n")
}
---

---
${imageStyle ? `Style: ${imageStyle}` : ""}
---

Script : ${script}

---

Script divided in words and timing: ${timedScript}

---

REMEMBER: JSON ARRAY WITH [{
	"description": "...",
	"start": ...,
	"end": ...,
}]`;

	const imageMapFromOpenAI = await promptAssistant({
		assistant_id: process.env.ASSISTANT_ARCHITECT_ID as string,
		prompt,
		isJSON: true,
	});

	const imageMap = imageMapFromOpenAI.map(
		(i: { description: string; start: number; end: number }) => ({
			description: i.description,
			start: i.start,
			end: i.end,
		}),
	);

	const client = getSupabaseAdmin();

	const iurl = `/${userId}/imagemap-${videoId}.json`;
	const imageMapUploadResult = await client.storage
		.from("imagemaps")
		.upload(iurl, JSON.stringify(imageMap), {
			cacheControl: "3600",
			upsert: true,
		});

	if (imageMapUploadResult.error) {
		throw imageMapUploadResult.error;
	}

	const {
		data: { publicUrl: imageMapURL },
	} = supabaseClient.storage.from("imagemaps").getPublicUrl(iurl);

	await updateVideo({
		userId,
		id: videoId,
		data: {
			imageMap: imageMapURL,
		},
	});

	return imageMap;
};
