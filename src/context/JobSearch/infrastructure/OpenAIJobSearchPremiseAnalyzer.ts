import type OpenAI from "openai";
import { OpenAIJsonObjectGenerator } from "../../Shared/infrastructure/OpenAIJsonObjectGenerator";
import { JobSearchFilter } from "../domain/JobSearchFilter";
import type { JobSearchPremise } from "../domain/JobSearchPremise";
import type { JobSearchPremiseAnalyzer } from "../domain/JobSearchPremiseAnalyzer";

export class OpenAIJobSearchPremiseAnalyzer
	implements JobSearchPremiseAnalyzer
{
	private readonly generator: OpenAIJsonObjectGenerator;

	constructor(openAIClient: OpenAI, model: string, language: string) {
		this.generator = new OpenAIJsonObjectGenerator(
			openAIClient,
			model,
			language,
		);
	}

	async analyze(premise: JobSearchPremise): Promise<JobSearchFilter> {
		const parsed = await this.generator.generate<{
			filter?: string;
			query?: string;
		}>({
			systemPrompt:
				'You are an assistant that transforms a job-search premise into a compact search filter string for scraping providers. Respond only with valid JSON using this exact shape: { "filter": string }. The filter must be concise and actionable.',
			userPrompt: `Premise: ${premise.value}`,
		});

		return new JobSearchFilter(parsed.filter ?? parsed.query ?? premise.value);
	}
}
