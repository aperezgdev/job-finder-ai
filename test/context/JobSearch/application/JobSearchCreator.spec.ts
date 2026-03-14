import { JobSearchCreator } from "../../../../src/context/JobSearch/application/JobSearchCreator";
import { JobSearchPeriodicityEnum } from "../../../../src/context/JobSearch/domain/JobSearchPeriodicity";
import type { JobSearchRepository } from "../../../../src/context/JobSearch/domain/JobSearchRepository";
import type { EventBus } from "../../../../src/context/Shared/domain/event/EventBus";

describe("JobSearchCreator", () => {
	it("saves job search and publishes domain events", async () => {
		const jobSearchRepository: JobSearchRepository = {
			save: jest.fn().mockResolvedValue(undefined),
			findById: jest.fn().mockResolvedValue(null),
			searchAllByChatId: jest.fn().mockResolvedValue([]),
			deleteById: jest.fn().mockResolvedValue(undefined),
			deleteAllByChatId: jest.fn().mockResolvedValue(undefined),
		};
		const eventBus: EventBus = {
			publish: jest.fn().mockResolvedValue(undefined),
			addSuscriber: jest.fn(),
		};

		const creator = new JobSearchCreator(jobSearchRepository, eventBus);

		await creator.run({
			id: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
			chatId: "123",
			premise: "Remote backend jobs",
			filter: "backend remote",
			periodicity: JobSearchPeriodicityEnum.WEEKLY,
			scheduledAtUtcHour: "09:30",
			minNotificationRating: 4,
		});

		expect(jobSearchRepository.save).toHaveBeenCalledTimes(1);
		expect(eventBus.publish).toHaveBeenCalledTimes(1);
		expect(eventBus.publish).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({
					eventName: "job_search.created",
					premise: "Remote backend jobs",
					filter: "backend remote",
					periodicity: "weekly",
					scheduledAtUtcHour: "09:30",
					minNotificationRating: 4,
				}),
			]),
		);
	});

	it("uses default periodicity when an empty value is provided", async () => {
		const jobSearchRepository: JobSearchRepository = {
			save: jest.fn().mockResolvedValue(undefined),
			findById: jest.fn().mockResolvedValue(null),
			searchAllByChatId: jest.fn().mockResolvedValue([]),
			deleteById: jest.fn().mockResolvedValue(undefined),
			deleteAllByChatId: jest.fn().mockResolvedValue(undefined),
		};
		const eventBus: EventBus = {
			publish: jest.fn().mockResolvedValue(undefined),
			addSuscriber: jest.fn(),
		};

		const creator = new JobSearchCreator(jobSearchRepository, eventBus);

		await creator.run({
			id: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
			chatId: "123",
			premise: "Remote backend jobs",
			filter: "backend remote",
			periodicity: "",
			scheduledAtUtcHour: "10:00",
			minNotificationRating: 4,
		});

		expect(eventBus.publish).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({
					periodicity: "daily",
				}),
			]),
		);
	});
});
