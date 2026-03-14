import { AplicationEvent } from "../../Shared/application/AplicationEvent";

export class JobOfferScrapped extends AplicationEvent {
	static EVENT_NAME = "job_offer_scrapped";
	readonly chatId: string;
	readonly title: string;
	readonly summary: string;
	readonly company: string;
	readonly premise: string;
	readonly provider: string;
	readonly link: string;
	readonly workMode: string;
	readonly location?: string;
	readonly salary?: number;
	readonly minNotificationRating: number;

	constructor(payload: {
		chatId: string;
		title: string;
		summary: string;
		company: string;
		premise: string;
		provider: string;
		link: string;
		workMode: string;
		location?: string;
		salary?: number;
		minNotificationRating: number;
	}) {
		super({
			eventName: JobOfferScrapped.EVENT_NAME,
		});
		this.chatId = payload.chatId;
		this.title = payload.title;
		this.summary = payload.summary;
		this.company = payload.company;
		this.premise = payload.premise;
		this.provider = payload.provider;
		this.link = payload.link;
		this.workMode = payload.workMode;
		this.location = payload.location;
		this.salary = payload.salary;
		this.minNotificationRating = payload.minNotificationRating;
	}
}
