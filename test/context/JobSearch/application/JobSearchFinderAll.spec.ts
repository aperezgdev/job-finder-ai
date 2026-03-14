import { JobSearchFinderAll } from "../../../../src/context/JobSearch/application/JobSearchFinderAll";
import { JobSearch } from "../../../../src/context/JobSearch/domain/JobSearch";
import { JobSearchFilter } from "../../../../src/context/JobSearch/domain/JobSearchFilter";
import { JobSearchId } from "../../../../src/context/JobSearch/domain/JobSearchId";
import { JobSearchPeriodicity } from "../../../../src/context/JobSearch/domain/JobSearchPeriodicity";
import { JobSearchPremise } from "../../../../src/context/JobSearch/domain/JobSearchPremise";
import type { JobSearchRepository } from "../../../../src/context/JobSearch/domain/JobSearchRepository";
import { JobSearchScheduledAtUtcHour } from "../../../../src/context/JobSearch/domain/JobSearchScheduledAtUtcHour";
import { JobMinNotificationRating } from "../../../../src/context/Shared/domain/JobMinNotificationRating";
import type { Logger } from "../../../../src/context/Shared/domain/Logger";

describe("JobSearchFinderAll", () => {
	it("returns all scheduled job searches as entities", async () => {
		const jobSearch = JobSearch.fromPrimitives({
			id: new JobSearchId("018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a"),
			chatId: "123",
			premise: new JobSearchPremise("TypeScript backend jobs"),
			filter: new JobSearchFilter("backend typescript remote"),
			periodicity: new JobSearchPeriodicity("weekly"),
			scheduledAtUtcHour: new JobSearchScheduledAtUtcHour("09:30"),
			minNotificationRating: new JobMinNotificationRating(4.5),
		});

		const jobSearchRepository: JobSearchRepository = {
			save: jest.fn().mockResolvedValue(undefined),
			findById: jest.fn().mockResolvedValue(jobSearch),
			searchAllByChatId: jest.fn().mockResolvedValue([jobSearch]),
			deleteById: jest.fn().mockResolvedValue(undefined),
			deleteAllByChatId: jest.fn().mockResolvedValue(undefined),
		};
		const logger: Logger = {
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		};

		const finder = new JobSearchFinderAll(jobSearchRepository, logger);
		const result = await finder.run({ chatId: "123" });

		expect(jobSearchRepository.searchAllByChatId).toHaveBeenCalledWith("123");
		expect(logger.info).toHaveBeenCalledTimes(2);
		expect(result).toEqual([jobSearch]);
	});
});
