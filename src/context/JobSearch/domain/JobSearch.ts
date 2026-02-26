import { AggregateRoot } from "../../Shared/domain/AggregateRoot";
import type { JobMinNotificationRating } from "../../Shared/domain/JobMinNotificationRating";
import { JobSearchCreated } from "./JobSearchCreated";
import type { JobSearchFilter } from "./JobSearchFilter";
import type { JobSearchId } from "./JobSearchId";
import type { JobSearchPeriodicity } from "./JobSearchPeriodicity";
import type { JobSearchPremise } from "./JobSearchPremise";
import type { JobSearchScheduledAtUtcHour } from "./JobSearchScheduledAtUtcHour";

export class JobSearch extends AggregateRoot {
	private readonly id: JobSearchId;
	private readonly premise: JobSearchPremise;
	private readonly filter: JobSearchFilter;
	private readonly periodicity: JobSearchPeriodicity;
	private readonly scheduledAtUtcHour: JobSearchScheduledAtUtcHour;
	private readonly minNotificationRating: JobMinNotificationRating;

	constructor(
		id: JobSearchId,
		premise: JobSearchPremise,
		filter: JobSearchFilter,
		periodicity: JobSearchPeriodicity,
		scheduledAtUtcHour: JobSearchScheduledAtUtcHour,
		minNotificationRating: JobMinNotificationRating,
	) {
		super();
		this.id = id;
		this.premise = premise;
		this.filter = filter;
		this.periodicity = periodicity;
		this.scheduledAtUtcHour = scheduledAtUtcHour;
		this.minNotificationRating = minNotificationRating;
	}

	static create({
		id,
		premise,
		filter,
		periodicity,
		scheduledAtUtcHour,
		minNotificationRating,
	}: {
		id: JobSearchId;
		premise: JobSearchPremise;
		filter: JobSearchFilter;
		periodicity: JobSearchPeriodicity;
		scheduledAtUtcHour: JobSearchScheduledAtUtcHour;
		minNotificationRating: JobMinNotificationRating;
	}): JobSearch {
		const jobSearch = new JobSearch(
			id,
			premise,
			filter,
			periodicity,
			scheduledAtUtcHour,
			minNotificationRating,
		);

		jobSearch.record(
			new JobSearchCreated({
				id: jobSearch.id.value,
				premise: jobSearch.premise.value,
				filter: jobSearch.filter.value,
				periodicity: jobSearch.periodicity.value,
				scheduledAtUtcHour: jobSearch.scheduledAtUtcHour.value,
				minNotificationRating: jobSearch.minNotificationRating.value,
			}),
		);

		return jobSearch;
	}

	static fromPrimitives({
		id,
		premise,
		filter,
		periodicity,
		scheduledAtUtcHour,
		minNotificationRating,
	}: {
		id: JobSearchId;
		premise: JobSearchPremise;
		filter: JobSearchFilter;
		periodicity: JobSearchPeriodicity;
		scheduledAtUtcHour: JobSearchScheduledAtUtcHour;
		minNotificationRating: JobMinNotificationRating;
	}): JobSearch {
		return new JobSearch(
			id,
			premise,
			filter,
			periodicity,
			scheduledAtUtcHour,
			minNotificationRating,
		);
	}

	toPrimitives(): {
		id: string;
		premise: string;
		filter: string;
		periodicity: string;
		scheduledAtUtcHour: string;
		minNotificationRating: number;
	} {
		return {
			id: this.id.value,
			premise: this.premise.value,
			filter: this.filter.value,
			periodicity: this.periodicity.value,
			scheduledAtUtcHour: this.scheduledAtUtcHour.value,
			minNotificationRating: this.minNotificationRating.value,
		};
	}
}
