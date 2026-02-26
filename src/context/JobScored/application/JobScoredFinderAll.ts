import type { Logger } from "../../Shared/domain/Logger";
import type {
	JobScoredRepository,
	JobScoredSummary,
} from "../domain/JobScoredRepository";

export class JobScoredFinderAll {
	constructor(
		private readonly jobScoredRepository: JobScoredRepository,
		private readonly logger: Logger,
	) {}

	async run(): Promise<Array<JobScoredSummary>> {
		this.logger.info("JobScoredFinderAll - run - Fetching scored jobs");
		const jobScoreds = await this.jobScoredRepository.searchAll();
		this.logger.info("JobScoredFinderAll - run - Scored jobs fetched", {
			count: jobScoreds.length,
		});

		return jobScoreds;
	}
}