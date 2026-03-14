import { JobSearchPremiseAnalyze } from "../../../../src/context/JobSearch/application/JobSearchPremiseAnalyze";
import { JobSearchFilter } from "../../../../src/context/JobSearch/domain/JobSearchFilter";
import type { JobSearchPremiseAnalyzer } from "../../../../src/context/JobSearch/domain/JobSearchPremiseAnalyzer";
import type { EventBus } from "../../../../src/context/Shared/domain/event/EventBus";

describe("JobSearchPremiseAnalyze", () => {
	it("analyzes premise and publishes JobSearchPremiseAnalyzed", async () => {
		const analyzer: JobSearchPremiseAnalyzer = {
			analyze: jest
				.fn()
				.mockResolvedValue(new JobSearchFilter("backend remote")),
		};
		const eventBus: EventBus = {
			publish: jest.fn().mockResolvedValue(undefined),
			addSuscriber: jest.fn(),
		};

		const useCase = new JobSearchPremiseAnalyze(analyzer, eventBus);

		await useCase.run({
			chatId: "123",
			premise: "Remote backend jobs",
			periodicity: "weekly",
			scheduledAtUtcHour: "09:30",
			minNotificationRating: 4,
		});

		expect(analyzer.analyze).toHaveBeenCalledTimes(1);
		expect(eventBus.publish).toHaveBeenCalledTimes(1);
		expect(eventBus.publish).toHaveBeenCalledWith([
			expect.objectContaining({
				eventName: "job_search_premise_analyzed",
				chatId: "123",
				premise: "Remote backend jobs",
				filter: "backend remote",
				periodicity: "weekly",
				scheduledAtUtcHour: "09:30",
				minNotificationRating: 4,
			}),
		]);
	});

	it("uses default min notification rating when omitted", async () => {
		const analyzer: JobSearchPremiseAnalyzer = {
			analyze: jest
				.fn()
				.mockResolvedValue(new JobSearchFilter("backend remote")),
		};
		const eventBus: EventBus = {
			publish: jest.fn().mockResolvedValue(undefined),
			addSuscriber: jest.fn(),
		};

		const useCase = new JobSearchPremiseAnalyze(analyzer, eventBus);

		await useCase.run({
			chatId: "123",
			premise: "Remote backend jobs",
			periodicity: "daily",
			scheduledAtUtcHour: "08:00",
		});

		expect(eventBus.publish).toHaveBeenCalledWith([
			expect.objectContaining({ minNotificationRating: 4 }),
		]);
	});
});
