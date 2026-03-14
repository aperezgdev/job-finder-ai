import type { EventBus } from "../../Shared/domain/event/EventBus";
import type { Logger } from "../../Shared/domain/Logger";
import { JobSearchDeleted } from "../domain/JobSearchDeleted";
import type { JobSearchRepository } from "../domain/JobSearchRepository";

export class JobSearchDeleteAll {
	constructor(
		private readonly jobSearchRepository: JobSearchRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger,
	) {}

	async run({ chatId }: { chatId: string }): Promise<number> {
		this.logger.info("JobSearchDeleteAll - run - Removing all job searches", {
			chatId,
		});
		const jobSearches =
			await this.jobSearchRepository.searchAllByChatId(chatId);
		const events = jobSearches.map(
			(jobSearch) =>
				new JobSearchDeleted({ id: jobSearch.toPrimitives().id, chatId }),
		);

		await this.jobSearchRepository.deleteAllByChatId(chatId);
		await this.eventBus.publish(events);

		this.logger.info("JobSearchDeleteAll - run - Job searches removed", {
			chatId,
			count: jobSearches.length,
		});

		return jobSearches.length;
	}
}
