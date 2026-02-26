import type { EventClass } from "../../Shared/domain/event/Event";
import type { EventSubscriber } from "../../Shared/domain/event/EventSubscriber";
import type { JobSearchCreator } from "./JobSearchCreator";
import { JobSearchPremiseAnalyzed } from "./JobSearchPremiseAnalyzed";

export class JobSearchCreatorOnPremiseAnalyzed
	implements EventSubscriber<JobSearchPremiseAnalyzed>
{
	constructor(private readonly jobSearchCreator: JobSearchCreator) {}

	subscribedTo(): Array<EventClass> {
		return [JobSearchPremiseAnalyzed];
	}

	async on(event: JobSearchPremiseAnalyzed): Promise<void> {
		await this.jobSearchCreator.run({
			id: event.jobSearchId,
			premise: event.premise,
			filter: event.filter,
			periodicity: event.periodicity,
			scheduledAtUtcHour: event.scheduledAtUtcHour,
			minNotificationRating: event.minNotificationRating,
		});
	}
}
