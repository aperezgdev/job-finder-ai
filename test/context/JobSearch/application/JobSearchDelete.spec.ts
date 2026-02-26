import { JobSearchDelete } from "../../../../src/context/JobSearch/application/JobSearchDelete";
import { JobSearch } from "../../../../src/context/JobSearch/domain/JobSearch";
import { JobSearchDeleted } from "../../../../src/context/JobSearch/domain/JobSearchDeleted";
import { JobSearchFilter } from "../../../../src/context/JobSearch/domain/JobSearchFilter";
import { JobSearchId } from "../../../../src/context/JobSearch/domain/JobSearchId";
import { JobSearchPeriodicity } from "../../../../src/context/JobSearch/domain/JobSearchPeriodicity";
import { JobSearchPremise } from "../../../../src/context/JobSearch/domain/JobSearchPremise";
import type { JobSearchRepository } from "../../../../src/context/JobSearch/domain/JobSearchRepository";
import { JobSearchScheduledAtUtcHour } from "../../../../src/context/JobSearch/domain/JobSearchScheduledAtUtcHour";
import type { EventBus } from "../../../../src/context/Shared/domain/event/EventBus";
import { JobMinNotificationRating } from "../../../../src/context/Shared/domain/JobMinNotificationRating";
import type { Logger } from "../../../../src/context/Shared/domain/Logger";
import { ValidationError } from "../../../../src/context/Shared/domain/ValidationError";

describe("JobSearchDelete", () => {
	it("deletes one job search and publishes deletion event", async () => {
		const jobSearch = JobSearch.fromPrimitives({
			id: new JobSearchId("018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a"),
			premise: new JobSearchPremise("TypeScript backend jobs"),
			filter: new JobSearchFilter("backend typescript remote"),
			periodicity: new JobSearchPeriodicity("weekly"),
			scheduledAtUtcHour: new JobSearchScheduledAtUtcHour("09:30"),
			minNotificationRating: new JobMinNotificationRating(4),
		});
		const repository: JobSearchRepository = {
			save: jest.fn().mockResolvedValue(undefined),
			findById: jest.fn().mockResolvedValue(jobSearch),
			searchAll: jest.fn().mockResolvedValue([]),
			deleteById: jest.fn().mockResolvedValue(undefined),
			deleteAll: jest.fn().mockResolvedValue(undefined),
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

		const useCase = new JobSearchDelete(repository, eventBus, logger);

		await useCase.run({ jobSearchId: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a" });

		expect(repository.findById).toHaveBeenCalledWith(
			"018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
		);
		expect(repository.deleteById).toHaveBeenCalledWith(
			"018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
		);
		expect(eventBus.publish).toHaveBeenCalledWith([
			expect.any(JobSearchDeleted),
		]);
	});

	it("throws validation error when job search does not exist", async () => {
		const repository: JobSearchRepository = {
			save: jest.fn().mockResolvedValue(undefined),
			findById: jest.fn().mockResolvedValue(null),
			searchAll: jest.fn().mockResolvedValue([]),
			deleteById: jest.fn().mockResolvedValue(undefined),
			deleteAll: jest.fn().mockResolvedValue(undefined),
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

		const useCase = new JobSearchDelete(repository, eventBus, logger);

		await expect(
			useCase.run({ jobSearchId: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a" }),
		).rejects.toBeInstanceOf(ValidationError);
		expect(eventBus.publish).not.toHaveBeenCalled();
		expect(repository.deleteById).not.toHaveBeenCalled();
	});
});
