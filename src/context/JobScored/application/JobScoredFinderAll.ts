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

	async run({ chatId }: { chatId: string }): Promise<Array<JobScoredSummary>> {
		this.logger.info("JobScoredFinderAll - run - Fetching scored jobs", {
			chatId,
		});
		const jobScoreds = await this.jobScoredRepository.searchAllByChatId(chatId);
		this.logger.info("JobScoredFinderAll - run - Scored jobs fetched", {
			chatId,
			count: jobScoreds.length,
		});

		return jobScoreds;
	}
}
