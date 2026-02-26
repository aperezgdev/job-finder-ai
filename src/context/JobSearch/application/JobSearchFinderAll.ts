import type { Logger } from "../../Shared/domain/Logger";
import type { JobSearch } from "../domain/JobSearch";
import type { JobSearchRepository } from "../domain/JobSearchRepository";

export class JobSearchFinderAll {
	constructor(
		private readonly jobSearchRepository: JobSearchRepository,
		private readonly logger: Logger,
	) {}

	async run(): Promise<Array<JobSearch>> {
		this.logger.info("JobSearchFinderAll - run - Fetching scheduled searches");
		const jobSearches = await this.jobSearchRepository.searchAll();
		this.logger.info("JobSearchFinderAll - run - Scheduled searches fetched", {
			count: jobSearches.length,
		});

		return jobSearches;
	}
}
