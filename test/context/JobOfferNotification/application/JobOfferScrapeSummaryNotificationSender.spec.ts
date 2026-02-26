import { JobOfferScrapeSummaryNotificationSender } from "../../../../src/context/JobOfferNotification/application/JobOfferScrapeSummaryNotificationSender";
import type { JobOfferNotifier } from "../../../../src/context/JobOfferNotification/domain/JobOfferNotifier";
import { JobSearchId } from "../../../../src/context/JobSearch/domain/JobSearchId";
import { JobPremise } from "../../../../src/context/Shared/domain/JobPremise";

describe("JobOfferScrapeSummaryNotificationSender", () => {
	it("maps VO inputs and calls notifier summary method", async () => {
		const notifier: JobOfferNotifier = {
			send: jest.fn().mockResolvedValue(undefined),
			sendScrapeSummary: jest.fn().mockResolvedValue(undefined),
		};

		const sender = new JobOfferScrapeSummaryNotificationSender(notifier);

		await sender.run({
			jobSearchId: new JobSearchId("018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a"),
			premise: new JobPremise("TypeScript backend jobs"),
			totalScraped: 18,
		});

		expect(notifier.sendScrapeSummary).toHaveBeenCalledTimes(1);
		expect(notifier.sendScrapeSummary).toHaveBeenCalledWith({
			jobSearchId: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
			premise: "TypeScript backend jobs",
			totalScraped: 18,
		});
	});
});
