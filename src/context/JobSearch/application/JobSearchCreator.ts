import type { EventBus } from "../../Shared/domain/event/EventBus";
import { JobMinNotificationRating } from "../../Shared/domain/JobMinNotificationRating";
import { JobSearch } from "../domain/JobSearch";
import { JobSearchFilter } from "../domain/JobSearchFilter";
import { JobSearchId } from "../domain/JobSearchId";
import { JobSearchPeriodicity } from "../domain/JobSearchPeriodicity";
import { JobSearchPremise } from "../domain/JobSearchPremise";
import type { JobSearchRepository } from "../domain/JobSearchRepository";
import { JobSearchScheduledAtUtcHour } from "../domain/JobSearchScheduledAtUtcHour";

export class JobSearchCreator {
	constructor(
		private readonly jobSearchRepository: JobSearchRepository,
		private readonly eventBus: EventBus,
	) {}

	async run({
		id,
		chatId,
		premise,
		filter,
		periodicity,
		scheduledAtUtcHour,
		minNotificationRating,
	}: {
		id: string;
		chatId: string;
		premise: string;
		filter: string;
		periodicity: string;
		scheduledAtUtcHour: string;
		minNotificationRating: number;
	}): Promise<void> {
		const jobSearchPeriodicity = periodicity
			? new JobSearchPeriodicity(periodicity)
			: JobSearchPeriodicity.default();

		const jobSearch = JobSearch.create({
			id: new JobSearchId(id),
			chatId,
			premise: new JobSearchPremise(premise),
			filter: new JobSearchFilter(filter),
			periodicity: jobSearchPeriodicity,
			scheduledAtUtcHour: new JobSearchScheduledAtUtcHour(scheduledAtUtcHour),
			minNotificationRating: new JobMinNotificationRating(
				minNotificationRating,
			),
		});

		await this.jobSearchRepository.save(jobSearch);
		await this.eventBus.publish(jobSearch.pullDomainEvents());
	}
}
