import type { EventBus } from "../../Shared/domain/event/EventBus";
import { JobCompany } from "../../Shared/domain/JobCompany";
import { JobLink } from "../../Shared/domain/JobLink";
import { JobLocation } from "../../Shared/domain/JobLocation";
import { JobMinNotificationRating } from "../../Shared/domain/JobMinNotificationRating";
import { JobOfferId } from "../../Shared/domain/JobOfferId";
import { JobProvider } from "../../Shared/domain/JobProvider";
import { JobSalary } from "../../Shared/domain/JobSalary";
import { JobSummary } from "../../Shared/domain/JobSummary";
import { JobTitle } from "../../Shared/domain/JobTitle";
import { JobWorkMode, JobWorkModeEnum } from "../../Shared/domain/JobWorkMode";
import type { Logger } from "../../Shared/domain/Logger";
import { JobScored } from "../domain/JobScored";
import { JobScoredComment } from "../domain/JobScoredComment";
import { JobScoredHighlights } from "../domain/JobScoredHighlights";
import { JobScoredRating } from "../domain/JobScoredRating";
import type { JobScoredRepository } from "../domain/JobScoredRepository";

export class JobScoredCreator {
	constructor(
		private readonly eventBus: EventBus,
		private readonly jobScoredRepository: JobScoredRepository,
		private readonly logger: Logger,
	) {}

	async run({
		chatId,
		jobOfferId,
		title,
		company,
		summary,
		provider,
		link,
		minNotificationRating,
		rating,
		comment,
		highlights,
		workMode,
		location,
		salary,
	}: {
		chatId: string;
		jobOfferId: string;
		title: string;
		company: string;
		summary: string;
		provider: string;
		link: string;
		minNotificationRating: number;
		rating: number;
		comment: string;
		highlights: string[];
		workMode?: string;
		location?: string;
		salary?: number;
	}): Promise<void> {
		this.logger.info("JobScoredCreator - run - Params into", {
			jobOfferId,
			title,
			company,
			provider,
			minNotificationRating,
			rating,
		});

		const jobScored = JobScored.create(
			chatId,
			new JobOfferId(jobOfferId),
			new JobTitle(title),
			new JobCompany(company),
			new JobSummary(summary),
			new JobProvider(provider),
			new JobLink(link),
			new JobMinNotificationRating(minNotificationRating),
			new JobScoredRating(rating),
			new JobScoredComment(comment),
			new JobScoredHighlights(highlights),
			new JobWorkMode(workMode ?? JobWorkModeEnum.UNSPECIFIED),
			location ? new JobLocation(location) : undefined,
			salary ? new JobSalary(salary) : undefined,
		);

		await this.jobScoredRepository.save(chatId, jobScored);
		this.logger.info("JobScoredCreator - run - Job scored persisted", {
			jobOfferId,
			rating,
		});

		await this.eventBus.publish(jobScored.pullDomainEvents());
		this.logger.info("JobScoredCreator - run - Domain events published");
	}
}
