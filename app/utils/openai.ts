import OpenAI from "openai";
let parseJson: (input: string) => any;
import("parse-json")
	.then((module) => {
		parseJson = module.default;
		// Use parseJson here
	})
	.catch((error) => {
		console.error("Failed to load parse-json module", error);
	});

const openai = new OpenAI({
	apiKey: "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",
	organization: process.env.OPENAI_ORG_ID,
});

const lemon = new OpenAI({
	apiKey: "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",
	baseURL: "https://api.lemonfox.ai/v1",
});

const sendAndAwaitResponse = async ({
	thread,
	message,
	assistant_id,
	isJSON,
}: {
	thread: any;
	message: string;
	assistant_id: string;
	isJSON: boolean;
}) => {
	// Send message to the thread
	await openai.beta.threads.messages.create(thread.id, {
		role: "user",
		content: message,
	});

	let run = await openai.beta.threads.runs.create(thread.id, {
		assistant_id,
	});

	let messageList;
	let messages;

	while (run.status !== "completed") {
		if (run.status === "failed") {
			throw new Error("Run failed");
		}
		run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
		messageList = await openai.beta.threads.messages.list(thread.id);
		messages = messageList.data;

		// wait 2 seconds
		await new Promise((resolve) => setTimeout(resolve, 2000));
	}

	if (!messages) {
		throw new Error("No messages found");
	}

	// @ts-ignore
	const answer = messages.filter((message) => message.role === "assistant")[0]
		.content[0].text.value;

	if (isJSON) {
		let jsonBlock;
		if (answer.includes("```json")) {
			jsonBlock = answer.replace("```json\n", "").replace("```", "");
		} else {
			jsonBlock = answer;
		}
		let jsonObject = jsonBlock;
		try {
			jsonObject = parseJson(jsonBlock);
		} catch (error) {
			console.error(`🛑 ERROR PARSING JSON`, error, jsonBlock);
		}
		return {
			result: jsonObject,
			threadId: run.thread_id,
		};
	} else {
		return {
			result: answer,
			threadId: run.thread_id,
		};
	}
};

export const askAssistant = async ({
	message,
	isJSON = false,
	threadId = undefined,
}: {
	message: string;
	isJSON?: boolean;
	threadId?: string | undefined;
}) => {
	try {
		let answer,
			newThreadId,
			thread = threadId
				? await openai.beta.threads.retrieve(threadId)
				: await openai.beta.threads.create();

		const result = await sendAndAwaitResponse({
			thread,
			message,
			assistant_id: process.env.ASSISTANT_SCRIPTWRITER_ID!,
			isJSON,
		});

		answer = result.result;
		newThreadId = result.threadId;

		return { ...answer, threadId: newThreadId };
	} catch (error: any) {
		console.error("ERROR ASKING ASSISTANT" + error.error.message);
	}
};
export default openai;
export { lemon };
