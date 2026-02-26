import { JobSearchCreatorOnPremiseAnalyzed } from "../../../../src/context/JobSearch/application/JobSearchCreatorOnPremiseAnalyzed";
import { JobSearchPremiseAnalyzed } from "../../../../src/context/JobSearch/application/JobSearchPremiseAnalyzed";

describe("JobSearchCreatorOnPremiseAnalyzed", () => {
	it("subscribes to JobSearchPremiseAnalyzed", () => {
		const jobSearchCreator = { run: jest.fn() };
		const subscriber = new JobSearchCreatorOnPremiseAnalyzed(
			jobSearchCreator as never,
		);

		expect(subscriber.subscribedTo()).toEqual([JobSearchPremiseAnalyzed]);
	});

	it("delegates event payload to JobSearchCreator", async () => {
		const jobSearchCreator = {
			run: jest.fn().mockResolvedValue(undefined),
		};
		const subscriber = new JobSearchCreatorOnPremiseAnalyzed(
			jobSearchCreator as never,
		);
		const event = new JobSearchPremiseAnalyzed({
			jobSearchId: "search-id",
			premise: "Remote backend jobs",
			filter: "backend remote",
			periodicity: "weekly",
			scheduledAtUtcHour: "09:30",
			minNotificationRating: 4,
		});

		await subscriber.on(event);

		expect(jobSearchCreator.run).toHaveBeenCalledTimes(1);
		expect(jobSearchCreator.run).toHaveBeenCalledWith({
			id: "search-id",
			premise: "Remote backend jobs",
			filter: "backend remote",
			periodicity: "weekly",
			scheduledAtUtcHour: "09:30",
			minNotificationRating: 4,
		});
	});
});
