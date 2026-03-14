import { JobScoredCreated } from "../../JobScored/domain/JobScoredCreated";
import type { EventClass } from "../../Shared/domain/event/Event";
import type { EventSubscriber } from "../../Shared/domain/event/EventSubscriber";
import type { JobOfferNotificationSender } from "./JobOfferNotificationSender";

export class NotifyJobOfferOnScoredCreated
	implements EventSubscriber<JobScoredCreated>
{
	constructor(private readonly sender: JobOfferNotificationSender) {}

	subscribedTo(): Array<EventClass> {
		return [JobScoredCreated];
	}

	async on(event: JobScoredCreated): Promise<void> {
		if (event.rating < event.minNotificationRating) {
			return;
		}

		await this.sender.run({
			chatId: event.chatId,
			jobScoredId: event.aggregateId,
			title: event.title,
			summary: event.summary,
			company: event.company,
			provider: event.provider,
			link: event.link,
			comment: event.comment,
			highlights: event.highlights,
			salary: event.salary,
			location: event.location,
			workMode: event.workMode,
			rating: event.rating,
		});
	}
}
