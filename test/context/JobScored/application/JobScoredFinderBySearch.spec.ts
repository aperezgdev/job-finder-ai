import { JobScoredFinderBySearch } from "../../../../src/context/JobScored/application/JobScoredFinderBySearch";
import type {
	JobScoredRepository,
	JobScoredSummary,
} from "../../../../src/context/JobScored/domain/JobScoredRepository";
import { JobSearch } from "../../../../src/context/JobSearch/domain/JobSearch";
import { JobSearchFilter } from "../../../../src/context/JobSearch/domain/JobSearchFilter";
import { JobSearchId } from "../../../../src/context/JobSearch/domain/JobSearchId";
import { JobSearchPeriodicity } from "../../../../src/context/JobSearch/domain/JobSearchPeriodicity";
import { JobSearchPremise } from "../../../../src/context/JobSearch/domain/JobSearchPremise";
import type { JobSearchRepository } from "../../../../src/context/JobSearch/domain/JobSearchRepository";
import { JobSearchScheduledAtUtcHour } from "../../../../src/context/JobSearch/domain/JobSearchScheduledAtUtcHour";
import { JobMinNotificationRating } from "../../../../src/context/Shared/domain/JobMinNotificationRating";
import type { Logger } from "../../../../src/context/Shared/domain/Logger";
import { ValidationError } from "../../../../src/context/Shared/domain/ValidationError";

describe("JobScoredFinderBySearch", () => {
	it("returns scored jobs for an existing search", async () => {
		const jobSearch = JobSearch.fromPrimitives({
			id: new JobSearchId("018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a"),
			chatId: "123",
			premise: new JobSearchPremise("TypeScript backend jobs"),
			filter: new JobSearchFilter("backend typescript remote"),
			periodicity: new JobSearchPeriodicity("weekly"),
			scheduledAtUtcHour: new JobSearchScheduledAtUtcHour("09:30"),
			minNotificationRating: new JobMinNotificationRating(4.5),
		});
		const scoredJobs: Array<JobScoredSummary> = [
			{
				id: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2c",
				jobOfferId: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2b",
				title: "Backend Engineer",
				company: "Acme",
				summary: "Node.js role",
				provider: "linkedin",
				link: "https://example.com/job/1",
				rating: 4.5,
				comment: "Strong fit",
				highlights: ["TypeScript", "Node.js"],
				workMode: "remote",
			},
		];

		const jobSearchRepository: JobSearchRepository = {
			save: jest.fn().mockResolvedValue(undefined),
			findById: jest.fn().mockResolvedValue(jobSearch),
			searchAllByChatId: jest.fn().mockResolvedValue([jobSearch]),
			deleteById: jest.fn().mockResolvedValue(undefined),
			deleteAllByChatId: jest.fn().mockResolvedValue(undefined),
		};
		const jobScoredRepository: JobScoredRepository = {
			save: jest.fn().mockResolvedValue(undefined),
			searchAllByChatId: jest.fn().mockResolvedValue([]),
			searchByJobSearchPremise: jest.fn().mockResolvedValue(scoredJobs),
		};
		const logger: Logger = {
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		};

		const useCase = new JobScoredFinderBySearch(
			jobSearchRepository,
			jobScoredRepository,
			logger,
		);

		const result = await useCase.run({
			jobSearchId: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
			chatId: "123",
		});

		expect(jobSearchRepository.findById).toHaveBeenCalledWith(
			"018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
			"123",
		);
		expect(jobScoredRepository.searchByJobSearchPremise).toHaveBeenCalledWith(
			"TypeScript backend jobs",
			"123",
		);
		expect(result).toEqual(scoredJobs);
	});

	it("throws validation error when job search does not exist", async () => {
		const jobSearchRepository: JobSearchRepository = {
			save: jest.fn().mockResolvedValue(undefined),
			findById: jest.fn().mockResolvedValue(null),
			searchAllByChatId: jest.fn().mockResolvedValue([]),
			deleteById: jest.fn().mockResolvedValue(undefined),
			deleteAllByChatId: jest.fn().mockResolvedValue(undefined),
		};
		const jobScoredRepository: JobScoredRepository = {
			save: jest.fn().mockResolvedValue(undefined),
			searchAllByChatId: jest.fn().mockResolvedValue([]),
			searchByJobSearchPremise: jest.fn().mockResolvedValue([]),
		};
		const logger: Logger = {
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		};

		const useCase = new JobScoredFinderBySearch(
			jobSearchRepository,
			jobScoredRepository,
			logger,
		);

		await expect(
			useCase.run({
				jobSearchId: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
				chatId: "123",
			}),
		).rejects.toBeInstanceOf(ValidationError);

		expect(jobScoredRepository.searchByJobSearchPremise).not.toHaveBeenCalled();
	});
});
