import { JobScoredFinderAll } from "../../../../src/context/JobScored/application/JobScoredFinderAll";
import type {
	JobScoredRepository,
	JobScoredSummary,
} from "../../../../src/context/JobScored/domain/JobScoredRepository";
import type { Logger } from "../../../../src/context/Shared/domain/Logger";

describe("JobScoredFinderAll", () => {
	it("returns all scored jobs", async () => {
		const scoredJobs: Array<JobScoredSummary> = [
			{
				id: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
				jobOfferId: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2b",
				title: "Senior Backend Engineer",
				company: "Acme",
				summary: "Node.js + TypeScript",
				provider: "linkedin",
				link: "https://example.com/job/1",
				rating: 4.5,
				comment: "Good match",
				highlights: ["TypeScript"],
				workMode: "remote",
			},
		];

		const repository: JobScoredRepository = {
			save: jest.fn().mockResolvedValue(undefined),
			searchAll: jest.fn().mockResolvedValue(scoredJobs),
			searchByJobSearchPremise: jest.fn().mockResolvedValue([]),
		};
		const logger: Logger = {
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		};

		const useCase = new JobScoredFinderAll(repository, logger);
		const result = await useCase.run();

		expect(repository.searchAll).toHaveBeenCalledTimes(1);
		expect(logger.info).toHaveBeenCalledTimes(2);
		expect(result).toEqual(scoredJobs);
	});
});