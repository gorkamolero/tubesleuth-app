import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
	apiKey: process.env.ASSEMBLY_AI_API_KEY,
});

export { client };
