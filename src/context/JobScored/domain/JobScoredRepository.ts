import type { JobScored } from "./JobScored";

export type JobScoredSummary = {
	id: string;
	jobOfferId: string;
	title: string;
	company: string;
	summary: string;
	provider: string;
	link: string;
	rating: number;
	comment: string;
	highlights: string[];
	workMode: string;
	location?: string;
	salary?: number;
};

export interface JobScoredRepository {
	save(chatId: string, jobScored: JobScored): Promise<void>;
	searchAllByChatId(chatId: string): Promise<Array<JobScoredSummary>>;
	searchByJobSearchPremise(
		premise: string,
		chatId: string,
	): Promise<Array<JobScoredSummary>>;
}
