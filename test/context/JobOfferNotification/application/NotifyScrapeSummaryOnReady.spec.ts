import { JobOffersScrapeSummaryReady } from "../../../../src/context/JobOffer/application/JobOffersScrapeSummaryReady";
import { NotifyScrapeSummaryOnReady } from "../../../../src/context/JobOfferNotification/application/NotifyScrapeSummaryOnReady";

describe("NotifyScrapeSummaryOnReady", () => {
	it("subscribes to JobOffersScrapeSummaryReady", () => {
		const sender = {
			run: jest.fn(),
		};

		const subscriber = new NotifyScrapeSummaryOnReady(sender as never);

		expect(subscriber.subscribedTo()).toEqual([JobOffersScrapeSummaryReady]);
	});

	it("sends summary with total scraped jobs", async () => {
		const sender = {
			run: jest.fn().mockResolvedValue(undefined),
		};

		const subscriber = new NotifyScrapeSummaryOnReady(sender as never);

		const event = new JobOffersScrapeSummaryReady({
			chatId: "123",
			jobSearchId: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
			premise: "TypeScript backend jobs",
			filter: "backend typescript remote",
			scrapedCount: 3,
			minNotificationRating: 4,
		});

		await subscriber.on(event);

		expect(sender.run).toHaveBeenCalledWith({
			chatId: "123",
			jobSearchId: expect.objectContaining({
				value: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
			}),
			premise: expect.objectContaining({ value: "TypeScript backend jobs" }),
			totalScraped: 3,
		});
	});
});
