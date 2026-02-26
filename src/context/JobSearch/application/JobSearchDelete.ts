import type { EventBus } from "../../Shared/domain/event/EventBus";
import type { Logger } from "../../Shared/domain/Logger";
import { ValidationError } from "../../Shared/domain/ValidationError";
import { JobSearchDeleted } from "../domain/JobSearchDeleted";
import type { JobSearchRepository } from "../domain/JobSearchRepository";

export class JobSearchDelete {
	constructor(
		private readonly jobSearchRepository: JobSearchRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger,
	) {}

	async run({ jobSearchId }: { jobSearchId: string }): Promise<void> {
		this.logger.info("JobSearchDelete - run - Params into", { jobSearchId });

		const jobSearch = await this.jobSearchRepository.findById(jobSearchId);

		if (!jobSearch) {
			throw new ValidationError("Job search not found.");
		}

		await this.jobSearchRepository.deleteById(jobSearchId);
		await this.eventBus.publish([
			new JobSearchDeleted({
				id: jobSearch.toPrimitives().id,
			}),
		]);

		this.logger.info("JobSearchDelete - run - Job search deleted", {
			jobSearchId,
		});
	}
}
