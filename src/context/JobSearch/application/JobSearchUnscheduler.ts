import { JobSearchId } from "../domain/JobSearchId";
import type { JobSearchScheduler } from "../domain/JobSearchScheduler";

export class JobSearchUnscheduler {
	constructor(private readonly scheduler: JobSearchScheduler) {}

	async run({ jobSearchId }: { jobSearchId: string }): Promise<void> {
		await this.scheduler.unschedule({
			jobSearchId: new JobSearchId(jobSearchId),
		});
	}
}
