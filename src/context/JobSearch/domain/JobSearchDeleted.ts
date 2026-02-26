import { DomainEvent } from "../../Shared/domain/event/DomainEvent";

export class JobSearchDeleted extends DomainEvent {
	static EVENT_NAME = "job_search.deleted";

	constructor(payload: { id: string }) {
		super({
			eventName: JobSearchDeleted.EVENT_NAME,
			aggregateId: payload.id,
		});
	}
}
