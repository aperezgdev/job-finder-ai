import { DomainEvent } from "../../Shared/domain/event/DomainEvent";

export class JobSearchCreated extends DomainEvent {
	static EVENT_NAME = "job_search.created";
	readonly premise: string;
	readonly filter: string;
	readonly periodicity: string;
	readonly scheduledAtUtcHour: string;
	readonly minNotificationRating: number;

	constructor(payload: {
		id: string;
		premise: string;
		filter: string;
		periodicity: string;
		scheduledAtUtcHour: string;
		minNotificationRating: number;
	}) {
		super({
			eventName: JobSearchCreated.EVENT_NAME,
			aggregateId: payload.id,
		});
		this.premise = payload.premise;
		this.filter = payload.filter;
		this.periodicity = payload.periodicity;
		this.scheduledAtUtcHour = payload.scheduledAtUtcHour;
		this.minNotificationRating = payload.minNotificationRating;
	}
}
