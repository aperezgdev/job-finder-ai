import { JobOfferCreated } from "../../JobOffer/domain/JobOfferCreated";
import type { EventClass } from "../../Shared/domain/event/Event";
import type { EventSubscriber } from "../../Shared/domain/event/EventSubscriber";
import type { Logger } from "../../Shared/domain/Logger";
import type { JobScoredRater } from "./JobScoredRater";

export class RateJobScoredOnOfferCreated
	implements EventSubscriber<JobOfferCreated>
{
	private static readonly DEFAULT_DEBOUNCE_MS = 2000;
	private static readonly DEFAULT_MAX_BATCH_SIZE = 10;

	private readonly pendingEvents: Array<JobOfferCreated> = [];
	private flushTimeout?: NodeJS.Timeout;
	private isFlushing = false;

	constructor(
		private readonly jobScoredRater: JobScoredRater,
		private readonly logger?: Logger,
		private readonly debounceMs: number = RateJobScoredOnOfferCreated.DEFAULT_DEBOUNCE_MS,
		private readonly maxBatchSize: number = RateJobScoredOnOfferCreated.DEFAULT_MAX_BATCH_SIZE,
	) {}

	subscribedTo(): Array<EventClass> {
		return [JobOfferCreated];
	}

	on(event: JobOfferCreated): Promise<void> {
		this.pendingEvents.push(event);
		this.scheduleFlush();

		if (this.pendingEvents.length >= this.maxBatchSize) {
			this.clearFlushTimeout();
			this.flushPending();
		}

		return Promise.resolve();
	}

	async flushPending(): Promise<void> {
		this.clearFlushTimeout();

		if (this.isFlushing || this.pendingEvents.length === 0) return;

		this.isFlushing = true;
		try {
			while (this.pendingEvents.length > 0) {
				const batch = this.pendingEvents.splice(0, this.maxBatchSize);
				await this.jobScoredRater.run(
					batch.map((event) => ({
						jobOfferId: event.aggregateId,
						premise: event.premise,
						title: event.title,
						company: event.company,
						summary: event.summary,
						provider: event.provider,
						link: event.link,
						minNotificationRating: event.minNotificationRating,
						workMode: event.workMode,
						location: event.location,
						salary: event.salary,
					})),
				);
			}
		} catch (error) {
			this.logger?.error(
				"RateJobScoredOnOfferCreated - flushPending - Error processing batch",
				error,
			);
		} finally {
			this.isFlushing = false;
			if (this.pendingEvents.length > 0) {
				this.scheduleFlush();
			}
		}
	}

	private scheduleFlush(): void {
		if (this.flushTimeout) return;

		this.flushTimeout = setTimeout(() => {
			this.flushTimeout = undefined;
			void this.flushPending();
		}, this.debounceMs);
	}

	private clearFlushTimeout(): void {
		if (!this.flushTimeout) return;

		clearTimeout(this.flushTimeout);
		this.flushTimeout = undefined;
	}
}
