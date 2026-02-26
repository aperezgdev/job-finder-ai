import { AplicationEvent } from "../../Shared/application/AplicationEvent";

export class JobOffersScrapeSummaryReady extends AplicationEvent {
	static EVENT_NAME = "job_offers_scrape_summary_ready";

	readonly jobSearchId: string;
	readonly premise: string;
	readonly filter: string;
	readonly scrapedCount: number;
	readonly minNotificationRating: number;

	constructor(payload: {
		jobSearchId: string;
		premise: string;
		filter: string;
		scrapedCount: number;
		minNotificationRating: number;
	}) {
		super({
			eventName: JobOffersScrapeSummaryReady.EVENT_NAME,
		});

		this.jobSearchId = payload.jobSearchId;
		this.premise = payload.premise;
		this.filter = payload.filter;
		this.scrapedCount = payload.scrapedCount;
		this.minNotificationRating = payload.minNotificationRating;
	}
}
