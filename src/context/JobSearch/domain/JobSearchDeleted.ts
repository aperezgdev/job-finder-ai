import { DomainEvent } from "../../Shared/domain/event/DomainEvent";

export class JobSearchDeleted extends DomainEvent {
	static EVENT_NAME = "job_search.deleted";
	readonly chatId: string;

	constructor(payload: { id: string; chatId: string }) {
		super({
			eventName: JobSearchDeleted.EVENT_NAME,
			aggregateId: payload.id,
		});
		this.chatId = payload.chatId;
	}
}
