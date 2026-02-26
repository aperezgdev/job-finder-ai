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
	save(jobScored: JobScored): Promise<void>;
	searchAll(): Promise<Array<JobScoredSummary>>;
	searchByJobSearchPremise(premise: string): Promise<Array<JobScoredSummary>>;
}
