import type OpenAI from "openai";
import { OpenAIJsonObjectGenerator } from "../../Shared/infrastructure/OpenAIJsonObjectGenerator";
import { JobScoredComment } from "../domain/JobScoredComment";
import { JobScoredHighlights } from "../domain/JobScoredHighlights";
import type {
	CandidateProfileSnapshot,
	JobScoredEvaluation,
	JobScoredRaterAI,
	JobScoredRaterInput,
} from "../domain/JobScoredRaterAI";
import { JobScoredRating } from "../domain/JobScoredRating";

export class OpenAIJobScoredRaterAI implements JobScoredRaterAI {
	private static readonly EVALUATION_SYSTEM_PROMPT =
		'You are a strict and skeptical job offer evaluator. Score only with evidence present in premise/title/summary/company/provider/link/work mode/location/salary/candidate profile snapshot. Never assume missing facts. If a requirement from premise or candidate profile snapshot is not explicitly supported by the offer data, treat it as unmet. Especially for company-type constraints (for example "empresa de producto"), verify with explicit signals in summary/company/provider/link text; if not verifiable, penalize clearly. Use this conservative rubric from 0 to 5: 0-1 very poor fit; 2 low fit; 3 acceptable/partial fit; 4 strong fit with clear evidence; 5 exceptional fit with multiple explicit matches and no major gaps. Default around 2.5-3 when evidence is mixed or incomplete. Avoid inflated ratings. rating must always be between 0 and 5, in increments of 0.5 only. In comment (max 512 chars), comments must be atomic (do not mention previous comments) explicitly mention the top mismatch or uncertainty first, then the strongest match. highlights must be short factual points grounded in provided text only (max 4 items).';

	private readonly generator: OpenAIJsonObjectGenerator;

	constructor(openAIClient: OpenAI, model: string, language: string) {
		this.generator = new OpenAIJsonObjectGenerator(
			openAIClient,
			model,
			language,
		);
	}

	async rate(
		inputs: Array<JobScoredRaterInput>,
	): Promise<Array<JobScoredEvaluation>> {
		if (inputs.length === 0) return [];

		const parsed = await this.generator.generate<{
			evaluations?: Array<{
				id?: string;
				rating: number;
				comment?: string;
				description?: string;
				highlights?: string[];
			}>;
		}>({
			systemPrompt: `${OpenAIJobScoredRaterAI.EVALUATION_SYSTEM_PROMPT} You must respond only with valid JSON using this exact shape: { "evaluations": [{ "id": string, "rating": number, "comment": string, "highlights": string[] }] }. Return exactly one evaluation per input id, preserving all ids without duplicates.`,
			userPrompt: `Evaluate these offers and return one evaluation per input id:\n${JSON.stringify(
				inputs.map((input) => this.toSerializableInput(input)),
			)}`,
		});

		if (!parsed.evaluations || parsed.evaluations.length !== inputs.length) {
			throw new Error(
				`OpenAIJobScoredRaterAI - rate - Invalid evaluations length. expected=${inputs.length} got=${parsed.evaluations?.length ?? 0}`,
			);
		}

		const evaluationsById = new Map<string, JobScoredEvaluation>();
		for (const evaluation of parsed.evaluations) {
			if (!evaluation.id) {
				throw new Error(
					"OpenAIJobScoredRaterAI - rate - Missing id in evaluation",
				);
			}

			if (evaluationsById.has(evaluation.id)) {
				throw new Error(
					`OpenAIJobScoredRaterAI - rate - Duplicate evaluation id: ${evaluation.id}`,
				);
			}

			evaluationsById.set(evaluation.id, this.toEvaluation(evaluation));
		}

		return inputs.map((input) => {
			const evaluation = evaluationsById.get(input.id);
			if (!evaluation) {
				throw new Error(
					`OpenAIJobScoredRaterAI - rate - Missing evaluation for id: ${input.id}`,
				);
			}

			return evaluation;
		});
	}

	private toEvaluation(parsed: {
		rating: number;
		comment?: string;
		description?: string;
		highlights?: string[];
	}): JobScoredEvaluation {
		return {
			rating: new JobScoredRating(parsed.rating),
			comment: new JobScoredComment(
				parsed.comment ?? parsed.description ?? "No comment provided",
			),
			highlights: new JobScoredHighlights(parsed.highlights ?? []),
		};
	}

	private toSerializableInput(input: JobScoredRaterInput): {
		id: string;
		premise: string;
		candidateProfile: CandidateProfileSnapshot | "N/A";
		title: string;
		summary: string;
		company: string;
		provider: string;
		link: string;
		workMode: string;
		location: string;
		salary: number | string;
	} {
		return {
			id: input.id,
			premise: input.premise.value,
			candidateProfile: input.candidateProfile ?? "N/A",
			title: input.title.value,
			summary: input.summary.value,
			company: input.company.value,
			provider: input.provider.value,
			link: input.link.value,
			workMode: input.workMode.value,
			location: input.location ? input.location.value : "N/A",
			salary: input.salary ? input.salary.value : "N/A",
		};
	}
}
