import type { EventClass } from "../../Shared/domain/event/Event";
import type { EventSubscriber } from "../../Shared/domain/event/EventSubscriber";
import { JobSearchDeleted } from "../domain/JobSearchDeleted";
import type { JobSearchUnscheduler } from "./JobSearchUnscheduler";

export class JobSearchUnschedulerOnDeleted
	implements EventSubscriber<JobSearchDeleted>
{
	constructor(private readonly jobSearchUnscheduler: JobSearchUnscheduler) {}

	subscribedTo(): Array<EventClass> {
		return [JobSearchDeleted];
	}

	async on(event: JobSearchDeleted): Promise<void> {
		await this.jobSearchUnscheduler.run({
			chatId: event.chatId,
			jobSearchId: event.aggregateId,
		});
	}
}
