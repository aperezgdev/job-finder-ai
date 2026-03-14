import type { JobSearchRepository } from "../../JobSearch/domain/JobSearchRepository";
import type { Logger } from "../../Shared/domain/Logger";
import { ValidationError } from "../../Shared/domain/ValidationError";
import type {
	JobScoredRepository,
	JobScoredSummary,
} from "../domain/JobScoredRepository";

export class JobScoredFinderBySearch {
	constructor(
		private readonly jobSearchRepository: JobSearchRepository,
		private readonly jobScoredRepository: JobScoredRepository,
		private readonly logger: Logger,
	) {}

	async run({
		jobSearchId,
		chatId,
	}: {
		jobSearchId: string;
		chatId: string;
	}): Promise<Array<JobScoredSummary>> {
		this.logger.info("JobScoredFinderBySearch - run - Params into", {
			jobSearchId,
			chatId,
		});

		const jobSearch = await this.jobSearchRepository.findById(
			jobSearchId,
			chatId,
		);
		if (!jobSearch) {
			throw new ValidationError("Job search not found.");
		}

		const { premise } = jobSearch.toPrimitives();
		const scoredJobs = await this.jobScoredRepository.searchByJobSearchPremise(
			premise,
			chatId,
		);

		this.logger.info("JobScoredFinderBySearch - run - Scored jobs fetched", {
			jobSearchId,
			chatId,
			premise,
			count: scoredJobs.length,
		});

		return scoredJobs;
	}
}
