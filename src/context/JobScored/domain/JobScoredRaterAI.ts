import type { JobCompany } from "../../Shared/domain/JobCompany";
import type { JobLink } from "../../Shared/domain/JobLink";
import type { JobLocation } from "../../Shared/domain/JobLocation";
import type { JobPremise } from "../../Shared/domain/JobPremise";
import type { JobProvider } from "../../Shared/domain/JobProvider";
import type { JobSalary } from "../../Shared/domain/JobSalary";
import type { JobSummary } from "../../Shared/domain/JobSummary";
import type { JobTitle } from "../../Shared/domain/JobTitle";
import type { JobWorkMode } from "../../Shared/domain/JobWorkMode";
import type { JobScoredComment } from "./JobScoredComment";
import type { JobScoredHighlights } from "./JobScoredHighlights";
import type { JobScoredRating } from "./JobScoredRating";

export interface JobScoredEvaluation {
	rating: JobScoredRating;
	comment: JobScoredComment;
	highlights: JobScoredHighlights;
}

export type JobScoredRaterInput = {
	id: string;
	premise: JobPremise;
	title: JobTitle;
	summary: JobSummary;
	company: JobCompany;
	provider: JobProvider;
	link: JobLink;
	workMode: JobWorkMode;
	location?: JobLocation;
	salary?: JobSalary;
};

export interface JobScoredRaterAI {
	rate(inputs: Array<JobScoredRaterInput>): Promise<Array<JobScoredEvaluation>>;
}
