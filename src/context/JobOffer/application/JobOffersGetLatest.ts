import type { JobSearchId } from "../../JobSearch/domain/JobSearchId";
import type { EventBus } from "../../Shared/domain/event/EventBus";
import type { JobMinNotificationRating } from "../../Shared/domain/JobMinNotificationRating";
import type { JobPremise } from "../../Shared/domain/JobPremise";
import type { JobSearchFilter } from "../../Shared/domain/JobSearchFilter";
import type { Logger } from "../../Shared/domain/Logger";
import type { JobOfferDatePostedPeriod } from "../domain/JobOfferDatePostedPeriod";
import type { JobOfferScrapper } from "../domain/JobOfferScrapper";
import { JobOfferScrapped } from "./JobOfferScrapped";
import { JobOffersScrapeSummaryReady } from "./JobOffersScrapeSummaryReady";

export class JobOffersGetLatest {
	constructor(
		private jobOfferScrapper: JobOfferScrapper,
		private eventBus: EventBus,
		private readonly logger: Logger,
	) {}

	async run({
		jobSearchId,
		premise,
		searchFilter,
		datePostedPeriod,
		minNotificationRating,
	}: {
		jobSearchId: JobSearchId;
		premise: JobPremise;
		searchFilter: JobSearchFilter;
		datePostedPeriod: JobOfferDatePostedPeriod;
		minNotificationRating: JobMinNotificationRating;
	}): Promise<void> {
		const startedAt = Date.now();
		this.logger.info("JobOffersGetLatest - run - Starting scrape", {
			searchFilter: searchFilter.value,
			datePostedPeriod: datePostedPeriod.value,
			minNotificationRating: minNotificationRating.value,
		});

		const jobOffers = await this.jobOfferScrapper.getLastJobOffers({
			searchFilter,
			datePostedPeriod,
		});

		this.logger.info("JobOffersGetLatest - run - Scrape completed", {
			offersFound: jobOffers.length,
			durationMs: Date.now() - startedAt,
		});

		const events = jobOffers.map((jobOffer) => {
			return new JobOfferScrapped({
				...jobOffer.toPrimitives(),
				minNotificationRating: minNotificationRating.value,
			});
		});

		const summaryEvent = new JobOffersScrapeSummaryReady({
			jobSearchId: jobSearchId.value,
			premise: premise.value,
			filter: searchFilter.value,
			scrapedCount: jobOffers.length,
			minNotificationRating: minNotificationRating.value,
		});

		await this.eventBus.publish([...events, summaryEvent]);
	}
}
