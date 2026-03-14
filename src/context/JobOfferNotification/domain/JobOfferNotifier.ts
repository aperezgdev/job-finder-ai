import type { JobScoredComment } from "../../JobScored/domain/JobScoredComment";
import type { JobScoredHighlights } from "../../JobScored/domain/JobScoredHighlights";
import type { JobScoredRating } from "../../JobScored/domain/JobScoredRating";
import type { JobCompany } from "../../Shared/domain/JobCompany";
import type { JobLink } from "../../Shared/domain/JobLink";
import type { JobLocation } from "../../Shared/domain/JobLocation";
import type { JobProvider } from "../../Shared/domain/JobProvider";
import type { JobSalary } from "../../Shared/domain/JobSalary";
import type { JobSummary } from "../../Shared/domain/JobSummary";
import type { JobTitle } from "../../Shared/domain/JobTitle";
import type { JobWorkMode } from "../../Shared/domain/JobWorkMode";

export interface JobOfferNotifier {
	send(input: {
		chatId: string;
		title: JobTitle;
		summary: JobSummary;
		company: JobCompany;
		provider: JobProvider;
		link: JobLink;
		salary?: JobSalary;
		location?: JobLocation;
		workMode?: JobWorkMode;
		rating: JobScoredRating;
		comment: JobScoredComment;
		highlights: JobScoredHighlights;
	}): Promise<void>;

	sendScrapeSummary(input: {
		chatId: string;
		jobSearchId: string;
		premise: string;
		totalScraped: number;
	}): Promise<void>;
}
