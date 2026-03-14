import { JobSearchId } from "../domain/JobSearchId";
import type { JobSearchScheduler } from "../domain/JobSearchScheduler";

export class JobSearchUnscheduler {
	constructor(private readonly scheduler: JobSearchScheduler) {}

	async run({
		jobSearchId,
		chatId,
	}: {
		jobSearchId: string;
		chatId: string;
	}): Promise<void> {
		await this.scheduler.unschedule({
			chatId,
			jobSearchId: new JobSearchId(jobSearchId),
		});
	}
}
