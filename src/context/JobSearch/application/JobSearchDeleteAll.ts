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

	async run(): Promise<number> {
		this.logger.info("JobSearchDeleteAll - run - Removing all job searches");
		const jobSearches = await this.jobSearchRepository.searchAll();
		const events = jobSearches.map(
			(jobSearch) => new JobSearchDeleted({ id: jobSearch.toPrimitives().id }),
		);

		await this.jobSearchRepository.deleteAll();
		await this.eventBus.publish(events);

		this.logger.info("JobSearchDeleteAll - run - Job searches removed", {
			count: jobSearches.length,
		});

		return jobSearches.length;
	}
}
