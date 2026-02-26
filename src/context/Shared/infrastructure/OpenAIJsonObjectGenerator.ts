import type OpenAI from "openai";

export class OpenAIJsonObjectGenerator {
	constructor(
		private readonly openAIClient: OpenAI,
		private readonly model: string,
		private readonly language: string = "en",
	) {}

	async generate<T extends Record<string, unknown>>({
		systemPrompt,
		userPrompt,
	}: {
		systemPrompt: string;
		userPrompt: string;
	}): Promise<T> {
		const response = await this.openAIClient.chat.completions.create({
			model: this.model,
			response_format: { type: "json_object" },
			messages: [
				{
					role: "system",
					content: `${systemPrompt} \n IMPORTANT: Respond in ISO 639-1 language code: ${this.language}`,
				},
				{
					role: "user",
					content: userPrompt,
				},
			],
		});

		if (!response || !response.choices || response.choices.length === 0) {
			throw new Error("No response from OpenAI");
		}

		const content = response.choices[0].message.content;
		if (!content) {
			throw new Error("No content in OpenAI response");
		}

		const rawJson = content
			.replace(/^```json\s*/i, "")
			.replace(/^```\s*/i, "")
			.replace(/\s*```$/, "");

		return JSON.parse(rawJson) as T;
	}
}
