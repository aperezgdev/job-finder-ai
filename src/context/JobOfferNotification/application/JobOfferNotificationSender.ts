import { JobScoredComment } from "../../JobScored/domain/JobScoredComment";
import { JobScoredHighlights } from "../../JobScored/domain/JobScoredHighlights";
import { JobScoredRating } from "../../JobScored/domain/JobScoredRating";
import { JobCompany } from "../../Shared/domain/JobCompany";
import { JobLink } from "../../Shared/domain/JobLink";
import { JobLocation } from "../../Shared/domain/JobLocation";
import { JobProvider } from "../../Shared/domain/JobProvider";
import { JobSalary } from "../../Shared/domain/JobSalary";
import { JobSummary } from "../../Shared/domain/JobSummary";
import { JobTitle } from "../../Shared/domain/JobTitle";
import { JobWorkMode } from "../../Shared/domain/JobWorkMode";
import type { JobOfferNotifier } from "../domain/JobOfferNotifier";

export class JobOfferNotificationSender {
	constructor(private readonly notifier: JobOfferNotifier) {}

	async run({
		chatId,
		title,
		summary,
		company,
		provider,
		link,
		salary,
		location,
		workMode,
		rating,
		comment,
		highlights,
	}: {
		chatId: string;
		jobScoredId: string;
		title: string;
		summary: string;
		company: string;
		provider: string;
		link: string;
		rating: number;
		comment: string;
		highlights: string[];
		salary?: number;
		location?: string;
		workMode?: string;
	}): Promise<void> {
		await this.notifier.send({
			chatId,
			title: new JobTitle(title),
			summary: new JobSummary(summary),
			company: new JobCompany(company),
			provider: new JobProvider(provider),
			link: new JobLink(link),
			salary: salary ? new JobSalary(salary) : undefined,
			location: location ? new JobLocation(location) : undefined,
			workMode: workMode ? new JobWorkMode(workMode) : undefined,
			rating: new JobScoredRating(rating),
			comment: new JobScoredComment(comment),
			highlights: new JobScoredHighlights(highlights),
		});
	}
}
