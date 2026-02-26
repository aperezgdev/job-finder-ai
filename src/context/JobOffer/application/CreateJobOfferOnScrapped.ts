import type { EventClass } from "../../Shared/domain/event/Event";
import type { EventSubscriber } from "../../Shared/domain/event/EventSubscriber";
import type { JobOfferCreator } from "./JobOfferCreator";
import { JobOfferScrapped } from "./JobOfferScrapped";

export class OnJobOffersScrapedCreator
	implements EventSubscriber<JobOfferScrapped>
{
	constructor(private readonly creator: JobOfferCreator) {}

	subscribedTo(): Array<EventClass> {
		return [JobOfferScrapped];
	}

	on(event: JobOfferScrapped): Promise<void> {
		return this.creator.create({
			title: event.title,
			company: event.company,
			summary: event.summary,
			premise: event.premise,
			provider: event.provider,
			link: event.link,
			workMode: event.workMode,
			location: event.location,
			salary: event.salary,
			minNotificationRating: event.minNotificationRating,
		});
	}
}
