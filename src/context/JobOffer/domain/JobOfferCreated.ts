import { DomainEvent } from "../../Shared/domain/event/DomainEvent";

export class JobOfferCreated extends DomainEvent {
	static EVENT_NAME = "job_offer.created";
	readonly chatId: string;
	readonly title: string;
	readonly summary: string;
	readonly company: string;
	readonly premise: string;
	readonly provider: string;
	readonly link: string;
	readonly minNotificationRating: number;
	readonly workMode: string;
	readonly location?: string;
	readonly salary?: number;

	constructor(payload: {
		id: string;
		chatId: string;
		title: string;
		summary: string;
		company: string;
		premise: string;
		provider: string;
		link: string;
		minNotificationRating: number;
		workMode: string;
		location?: string;
		salary?: number;
	}) {
		super({
			eventName: JobOfferCreated.EVENT_NAME,
			aggregateId: payload.id,
		});
		this.chatId = payload.chatId;
		this.title = payload.title;
		this.summary = payload.summary;
		this.company = payload.company;
		this.premise = payload.premise;
		this.provider = payload.provider;
		this.link = payload.link;
		this.minNotificationRating = payload.minNotificationRating;
		this.workMode = payload.workMode;
		this.location = payload.location;
		this.salary = payload.salary;
	}
}
