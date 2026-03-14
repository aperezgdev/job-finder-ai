import { JobOffersScrapeSummaryReady } from "../../JobOffer/application/JobOffersScrapeSummaryReady";
import { JobSearchId } from "../../JobSearch/domain/JobSearchId";
import type { EventClass } from "../../Shared/domain/event/Event";
import type { EventSubscriber } from "../../Shared/domain/event/EventSubscriber";
import { JobPremise } from "../../Shared/domain/JobPremise";
import type { JobOfferScrapeSummaryNotificationSender } from "./JobOfferScrapeSummaryNotificationSender";

export class NotifyScrapeSummaryOnReady
	implements EventSubscriber<JobOffersScrapeSummaryReady>
{
	constructor(
		private readonly sender: JobOfferScrapeSummaryNotificationSender,
	) {}

	subscribedTo(): Array<EventClass> {
		return [JobOffersScrapeSummaryReady];
	}

	async on(event: JobOffersScrapeSummaryReady): Promise<void> {
		await this.sender.run({
			chatId: event.chatId,
			jobSearchId: new JobSearchId(event.jobSearchId),
			premise: new JobPremise(event.premise),
			totalScraped: event.scrapedCount,
		});
	}
}
