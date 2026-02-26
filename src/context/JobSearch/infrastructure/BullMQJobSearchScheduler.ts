import { type ConnectionOptions, Queue } from "bullmq";
import type { JobMinNotificationRating } from "../../Shared/domain/JobMinNotificationRating";
import type { JobSearchFilter } from "../domain/JobSearchFilter";
import type { JobSearchId } from "../domain/JobSearchId";
import type {
	JobSearchPeriodicity,
	JobSearchPeriodicityEnum,
} from "../domain/JobSearchPeriodicity";
import type { JobSearchPremise } from "../domain/JobSearchPremise";
import type { JobSearchScheduledAtUtcHour } from "../domain/JobSearchScheduledAtUtcHour";
import type { JobSearchScheduler } from "../domain/JobSearchScheduler";

export const JOB_SEARCH_SCRAPE_QUEUE_NAME = "job-search-scrape";
export const JOB_SEARCH_SCRAPE_JOB_NAME = "job-search-scrape.execute";

const MILLISECONDS_BY_PERIODICITY: Record<JobSearchPeriodicityEnum, number> = {
	daily: 24 * 60 * 60 * 1000,
	weekly: 7 * 24 * 60 * 60 * 1000,
	biweekly: 14 * 24 * 60 * 60 * 1000,
	monthly: 30 * 24 * 60 * 60 * 1000,
};

const DATE_POSTED_BY_PERIODICITY: Record<
	JobSearchPeriodicityEnum,
	"24h" | "week" | "month"
> = {
	daily: "24h",
	weekly: "week",
	biweekly: "month",
	monthly: "month",
};

export class BullMQJobSearchScheduler implements JobSearchScheduler {
	private readonly queue: Queue;
	private readonly maxAttempts: number;
	private readonly retryBackoffMs: number;

	constructor(params: {
		connection: ConnectionOptions;
		prefix?: string;
		maxAttempts: number;
		retryBackoffMs: number;
	}) {
		this.queue = new Queue(JOB_SEARCH_SCRAPE_QUEUE_NAME, {
			connection: params.connection,
			prefix: params.prefix,
		});
		this.maxAttempts = Math.max(1, params.maxAttempts);
		this.retryBackoffMs = Math.max(100, params.retryBackoffMs);
	}

	async schedule(payload: {
		jobSearchId: JobSearchId;
		premise: JobSearchPremise;
		filter: JobSearchFilter;
		periodicity: JobSearchPeriodicity;
		scheduledAtUtcHour: JobSearchScheduledAtUtcHour;
		minNotificationRating: JobMinNotificationRating;
	}): Promise<void> {
		const datePostedPeriod =
			DATE_POSTED_BY_PERIODICITY[payload.periodicity.value];
		const hour = payload.scheduledAtUtcHour.hour();
		const minute = payload.scheduledAtUtcHour.minutes();
		const startDate = this.nextUtcDate(hour, minute);

		await this.queue.upsertJobScheduler(
			payload.jobSearchId.value,
			{
				every: MILLISECONDS_BY_PERIODICITY[payload.periodicity.value],
				startDate,
			},
			{
				name: JOB_SEARCH_SCRAPE_JOB_NAME,
				data: {
					jobSearchId: payload.jobSearchId.value,
					premise: payload.premise.value,
					filter: payload.filter.value,
					datePostedPeriod,
					minNotificationRating: payload.minNotificationRating.value,
				},
				opts: {
					attempts: this.maxAttempts,
					backoff: {
						type: "exponential",
						delay: this.retryBackoffMs,
					},
					removeOnComplete: true,
					removeOnFail: false,
				},
			},
		);
	}

	private nextUtcDate(hour: number, minute: number): Date {
		const now = new Date();
		const scheduled = new Date(
			Date.UTC(
				now.getUTCFullYear(),
				now.getUTCMonth(),
				now.getUTCDate(),
				hour,
				minute,
				0,
				0,
			),
		);

		if (scheduled <= now) {
			scheduled.setUTCDate(scheduled.getUTCDate() + 1);
		}

		return scheduled;
	}

	async unschedule(payload: { jobSearchId: JobSearchId }): Promise<void> {
		await this.queue.removeJobScheduler(payload.jobSearchId.value);
	}
}
