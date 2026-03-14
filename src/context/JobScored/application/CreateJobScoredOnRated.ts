import type { EventClass } from "../../Shared/domain/event/Event";
import type { EventSubscriber } from "../../Shared/domain/event/EventSubscriber";
import type { JobScoredCreator } from "./JobScoredCreator";
import { JobScoredRated } from "./JobScoredRated";

export class CreateJobScoredOnRated implements EventSubscriber<JobScoredRated> {
	constructor(private readonly jobScoredCreator: JobScoredCreator) {}

	subscribedTo(): Array<EventClass> {
		return [JobScoredRated];
	}

	on(event: JobScoredRated): Promise<void> {
		return this.jobScoredCreator.run({
			chatId: event.chatId,
			jobOfferId: event.jobOfferId,
			title: event.title,
			company: event.company,
			summary: event.summary,
			provider: event.provider,
			link: event.link,
			minNotificationRating: event.minNotificationRating,
			rating: event.rating,
			comment: event.comment,
			highlights: event.highlights,
			workMode: event.workMode,
			location: event.location,
			salary: event.salary,
		});
	}
}
