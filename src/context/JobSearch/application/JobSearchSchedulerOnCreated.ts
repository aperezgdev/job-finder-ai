import type { EventClass } from "../../Shared/domain/event/Event";
import type { EventSubscriber } from "../../Shared/domain/event/EventSubscriber";
import { JobMinNotificationRating } from "../../Shared/domain/JobMinNotificationRating";
import { JobSearchCreated } from "../domain/JobSearchCreated";
import { JobSearchFilter } from "../domain/JobSearchFilter";
import { JobSearchId } from "../domain/JobSearchId";
import { JobSearchPeriodicity } from "../domain/JobSearchPeriodicity";
import { JobSearchPremise } from "../domain/JobSearchPremise";
import { JobSearchScheduledAtUtcHour } from "../domain/JobSearchScheduledAtUtcHour";
import type { JobSearchScheduler } from "../domain/JobSearchScheduler";

export class JobSearchSchedulerOnCreated
	implements EventSubscriber<JobSearchCreated>
{
	constructor(private readonly scheduler: JobSearchScheduler) {}

	subscribedTo(): Array<EventClass> {
		return [JobSearchCreated];
	}

	async on(event: JobSearchCreated): Promise<void> {
		await this.scheduler.schedule({
			jobSearchId: new JobSearchId(event.aggregateId),
			premise: new JobSearchPremise(event.premise),
			filter: new JobSearchFilter(event.filter),
			periodicity: new JobSearchPeriodicity(event.periodicity),
			scheduledAtUtcHour: new JobSearchScheduledAtUtcHour(
				event.scheduledAtUtcHour,
			),
			minNotificationRating: new JobMinNotificationRating(
				event.minNotificationRating,
			),
		});
	}
}
