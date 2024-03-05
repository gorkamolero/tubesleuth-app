import OpenAI from "openai";
import { architect } from "./ai/architect";

const apiKey = process.env.OPENAI_AK;
const organization = process.env.OPENAI_ORG_ID;
const openai = new OpenAI({
	apiKey: apiKey,
	organization,
});

const lemon = new OpenAI({
	apiKey: process.env.LEMONFOX_API_KEY,
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

	// assistant messages
	const aM = messages.filter((message) => message.role === "assistant");

	// @ts-ignore
	const answer = aM[0].content[0].text.value;

	if (isJSON) {
		let jsonBlock;
		if (answer.includes("```json")) {
			jsonBlock = answer.replace("```json\n", "").replace("```", "");
		} else {
			jsonBlock = answer;
		}
		let jsonObject = jsonBlock;
		try {
			jsonObject = JSON.parse(jsonBlock);
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

interface AskInterface {
	systemMessage: string;
	message: string;
	isJSON?: boolean;
}

export const askLemon = async ({
	systemMessage,
	message,
	isJSON = false,
}: AskInterface) => {
	try {
		const completion = await lemon.chat.completions.create({
			messages: [
				{
					role: "system",
					content: systemMessage,
				},
				{
					role: "user",
					content: message,
				},
			],
			model: "mixtral-chat",
		});

		let result = completion.choices[0].message.content;

		console.log("🍋 LEMON RESULT", result);

		if (isJSON) {
			let jsonObject = result;

			if (result && result?.length > 0) {
				try {
					jsonObject = JSON.parse(result);
				} catch (error) {
					console.error(`🛑 ERROR PARSING JSON`, error, result);
				}
				return jsonObject;
			} else {
				return { error: "No result" };
			}
		} else {
			return result;
		}
	} catch (error: any) {
		console.error("ERROR ASKING LEMON" + error.error.message);
	}
};

export const askChatGPT = async ({
	systemMessage,
	message,
	isJSON = false,
}: AskInterface) => {
	try {
		const completion = await openai.chat.completions.create({
			messages: [
				{
					role: "system",
					content: systemMessage,
				},
				{
					role: "user",
					content: message,
				},
			],
			model: "gpt-4-0125-preview",
		});

		let result = completion.choices[0].message.content;

		console.log("🤖 GPT RESULT", result);

		if (!isJSON) return result;
		if (!result) return { error: "No result" };

		const jsonBlock = result.includes("```json")
			? result.replace("```json\n", "").replace("```", "")
			: result;
		try {
			return JSON.parse(jsonBlock);
		} catch (error) {
			console.error(`🛑 ERROR PARSING JSON`, error, result);
			return null;
		}
	} catch (error: any) {
		console.error("ERROR ASKING GPT" + error.error.message);
	}
};

export const promptAssistant = async ({
	assistant_id,
	prompt,
	isJSON,
}: {
	assistant_id: string;
	prompt: string;
	isJSON: boolean;
}) => {
	const thread = await openai.beta.threads.create();
	const { result: answer } = await sendAndAwaitResponse({
		thread,
		message: prompt,
		assistant_id,
		isJSON,
	});

	return answer;
};

export default openai;
export { lemon };
