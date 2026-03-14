import type { Logger } from "../../Shared/domain/Logger";
import type { JobSearch } from "../domain/JobSearch";
import type { JobSearchRepository } from "../domain/JobSearchRepository";

export class JobSearchFinderAll {
	constructor(
		private readonly jobSearchRepository: JobSearchRepository,
		private readonly logger: Logger,
	) {}

	async run({ chatId }: { chatId: string }): Promise<Array<JobSearch>> {
		this.logger.info("JobSearchFinderAll - run - Fetching scheduled searches", {
			chatId,
		});
		const jobSearches =
			await this.jobSearchRepository.searchAllByChatId(chatId);
		this.logger.info("JobSearchFinderAll - run - Scheduled searches fetched", {
			chatId,
			count: jobSearches.length,
		});

		return jobSearches;
	}
}
