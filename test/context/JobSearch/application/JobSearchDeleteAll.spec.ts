import { JobSearchDeleteAll } from "../../../../src/context/JobSearch/application/JobSearchDeleteAll";
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

describe("JobSearchDeleteAll", () => {
	it("unschedules and deletes all job searches", async () => {
		const firstSearch = JobSearch.fromPrimitives({
			id: new JobSearchId("018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a"),
			premise: new JobSearchPremise("TypeScript backend jobs"),
			filter: new JobSearchFilter("backend typescript remote"),
			periodicity: new JobSearchPeriodicity("weekly"),
			scheduledAtUtcHour: new JobSearchScheduledAtUtcHour("09:30"),
			minNotificationRating: new JobMinNotificationRating(4),
		});
		const secondSearch = JobSearch.fromPrimitives({
			id: new JobSearchId("018f6b5a-6b70-7cc6-b79f-4f88db0d1e2b"),
			premise: new JobSearchPremise("Go backend jobs"),
			filter: new JobSearchFilter("backend golang remote"),
			periodicity: new JobSearchPeriodicity("daily"),
			scheduledAtUtcHour: new JobSearchScheduledAtUtcHour("10:00"),
			minNotificationRating: new JobMinNotificationRating(4.5),
		});

		const repository: JobSearchRepository = {
			save: jest.fn().mockResolvedValue(undefined),
			findById: jest.fn().mockResolvedValue(null),
			searchAll: jest.fn().mockResolvedValue([firstSearch, secondSearch]),
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

		const useCase = new JobSearchDeleteAll(repository, eventBus, logger);
		const deletedCount = await useCase.run();

		expect(repository.deleteAll).toHaveBeenCalledTimes(1);
		expect(eventBus.publish).toHaveBeenCalledTimes(1);
		expect(eventBus.publish).toHaveBeenCalledWith([
			expect.any(JobSearchDeleted),
			expect.any(JobSearchDeleted),
		]);
		expect(deletedCount).toBe(2);
	});
});
