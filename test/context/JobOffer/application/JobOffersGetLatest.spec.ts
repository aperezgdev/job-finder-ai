import { JobOffersGetLatest } from "../../../../src/context/JobOffer/application/JobOffersGetLatest";
import { JobOfferDatePostedPeriod } from "../../../../src/context/JobOffer/domain/JobOfferDatePostedPeriod";
import type { JobOfferScrapper } from "../../../../src/context/JobOffer/domain/JobOfferScrapper";
import { JobSearchId } from "../../../../src/context/JobSearch/domain/JobSearchId";
import type { EventBus } from "../../../../src/context/Shared/domain/event/EventBus";
import { JobMinNotificationRating } from "../../../../src/context/Shared/domain/JobMinNotificationRating";
import { JobPremise } from "../../../../src/context/Shared/domain/JobPremise";
import type { JobSearchFilter } from "../../../../src/context/Shared/domain/JobSearchFilter";
import type { Logger } from "../../../../src/context/Shared/domain/Logger";

describe("JobOffersGetLatest", () => {
	it("gets offers from scrapper and publishes scrapped events", async () => {
		const jobOfferScrapper: JobOfferScrapper = {
			getLastJobOffers: jest.fn().mockResolvedValue([
				{
					toPrimitives: () => ({
						title: "Backend Engineer",
						summary: "Node.js role",
						company: "Acme",
						premise: "Remote backend jobs",
						provider: "linkedin",
						link: "https://example.com/job/1",
						workMode: "remote",
						location: "Madrid",
						salary: 50000,
					}),
				} as never,
			]),
		};
		const eventBus: EventBus = {
			publish: jest.fn().mockResolvedValue(undefined),
			addSuscriber: jest.fn(),
		};
		const logger: Logger = {
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		};

		const useCase = new JobOffersGetLatest(jobOfferScrapper, eventBus, logger);
		const searchFilter = { value: "backend" } as JobSearchFilter;
		const datePostedPeriod = new JobOfferDatePostedPeriod("24h");
		const minNotificationRating = new JobMinNotificationRating(4);

		await useCase.run({
			jobSearchId: new JobSearchId("018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a"),
			premise: new JobPremise("TypeScript backend jobs"),
			searchFilter,
			datePostedPeriod,
			minNotificationRating,
		});

		expect(jobOfferScrapper.getLastJobOffers).toHaveBeenCalledWith({
			searchFilter,
			datePostedPeriod,
		});
		expect(eventBus.publish).toHaveBeenCalledTimes(1);
		expect(eventBus.publish).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({
					eventName: "job_offer_scrapped",
					minNotificationRating: 4,
				}),
				expect.objectContaining({
					eventName: "job_offers_scrape_summary_ready",
					jobSearchId: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
					premise: "TypeScript backend jobs",
					scrapedCount: 1,
					minNotificationRating: 4,
				}),
			]),
		);
	});
});
