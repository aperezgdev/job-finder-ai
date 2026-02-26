import type { EventBus } from "../../Shared/domain/event/EventBus";
import { JobCompany } from "../../Shared/domain/JobCompany";
import { JobLink } from "../../Shared/domain/JobLink";
import { JobLocation } from "../../Shared/domain/JobLocation";
import { JobMinNotificationRating } from "../../Shared/domain/JobMinNotificationRating";
import { JobPremise } from "../../Shared/domain/JobPremise";
import { JobProvider } from "../../Shared/domain/JobProvider";
import { JobSalary } from "../../Shared/domain/JobSalary";
import { JobSummary } from "../../Shared/domain/JobSummary";
import { JobTitle } from "../../Shared/domain/JobTitle";
import { JobWorkMode, JobWorkModeEnum } from "../../Shared/domain/JobWorkMode";
import type { Logger } from "../../Shared/domain/Logger";
import { JobOffer } from "../domain/JobOffer";
import type { JobOfferRepository } from "../domain/JobOfferRepository";

export class JobOfferCreator {
	constructor(
		private readonly jobOfferRepository: JobOfferRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger,
	) {}

	async create({
		title,
		company,
		summary,
		premise,
		provider,
		link,
		minNotificationRating,
		workMode,
		location,
		salary,
	}: {
		title: string;
		company: string;
		summary: string;
		premise: string;
		provider: string;
		link: string;
		minNotificationRating: number;
		workMode?: string;
		location?: string;
		salary?: number;
	}): Promise<void> {
		this.logger.info("JobOfferCreator - create - Params into", {
			title,
			company,
			provider,
			link,
			minNotificationRating,
		});

		const resolvedWorkMode = workMode ?? JobWorkModeEnum.UNSPECIFIED;
		const jobOffer = JobOffer.create({
			title: new JobTitle(title),
			company: new JobCompany(company),
			summary: new JobSummary(summary),
			premise: new JobPremise(premise),
			provider: new JobProvider(provider),
			link: new JobLink(link),
			minNotificationRating: new JobMinNotificationRating(
				minNotificationRating,
			),
			workMode: new JobWorkMode(resolvedWorkMode),
			location: new JobLocation(location ?? ""),
			salary: new JobSalary(salary ?? 0),
		});

		await this.jobOfferRepository.save(jobOffer);
		this.logger.info("JobOfferCreator - create - Job offer persisted", {
			link,
			company,
		});

		await this.eventBus.publish(jobOffer.pullDomainEvents());
		this.logger.info("JobOfferCreator - create - Domain events published");
	}
}
