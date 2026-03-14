import { DomainEvent } from "../../Shared/domain/event/DomainEvent";

export class JobScoredCreated extends DomainEvent {
	static EVENT_NAME = "job_scored.created";
	readonly chatId: string;

	readonly title: string;
	readonly summary: string;
	readonly company: string;
	readonly provider: string;
	readonly link: string;
	readonly minNotificationRating: number;
	readonly rating: number;
	readonly comment: string;
	readonly highlights: string[];
	readonly workMode: string;
	readonly location?: string;
	readonly salary?: number;

	constructor(payload: {
		id: string;
		chatId: string;
		title: string;
		summary: string;
		company: string;
		provider: string;
		link: string;
		minNotificationRating: number;
		rating: number;
		comment: string;
		highlights: string[];
		workMode: string;
		location?: string;
		salary?: number;
	}) {
		super({
			eventName: JobScoredCreated.EVENT_NAME,
			aggregateId: payload.id,
		});
		this.chatId = payload.chatId;
		this.title = payload.title;
		this.summary = payload.summary;
		this.company = payload.company;
		this.provider = payload.provider;
		this.link = payload.link;
		this.minNotificationRating = payload.minNotificationRating;
		this.rating = payload.rating;
		this.comment = payload.comment;
		this.highlights = payload.highlights;
		this.workMode = payload.workMode;
		this.location = payload.location;
		this.salary = payload.salary;
	}
}
