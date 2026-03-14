import { AplicationEvent } from "../../Shared/application/AplicationEvent";

export class JobSearchPremiseAnalyzed extends AplicationEvent {
	static EVENT_NAME = "job_search_premise_analyzed";
	readonly jobSearchId: string;
	readonly chatId: string;
	readonly premise: string;
	readonly filter: string;
	readonly minNotificationRating: number;
	readonly periodicity: string;
	readonly scheduledAtUtcHour: string;

	constructor(payload: {
		jobSearchId: string;
		chatId: string;
		premise: string;
		filter: string;
		minNotificationRating: number;
		periodicity: string;
		scheduledAtUtcHour: string;
	}) {
		super({
			eventName: JobSearchPremiseAnalyzed.EVENT_NAME,
		});
		this.jobSearchId = payload.jobSearchId;
		this.chatId = payload.chatId;
		this.premise = payload.premise;
		this.periodicity = payload.periodicity;
		this.scheduledAtUtcHour = payload.scheduledAtUtcHour;
		this.filter = payload.filter;
		this.minNotificationRating = payload.minNotificationRating;
	}
}
