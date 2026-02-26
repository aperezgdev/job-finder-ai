import { Queue, Worker } from "bullmq";
import type { JobOffersGetLatest } from "../../context/JobOffer/application/JobOffersGetLatest";
import { JobOfferDatePostedPeriod } from "../../context/JobOffer/domain/JobOfferDatePostedPeriod";
import { JobSearchId } from "../../context/JobSearch/domain/JobSearchId";
import {
	JOB_SEARCH_SCRAPE_JOB_NAME,
	JOB_SEARCH_SCRAPE_QUEUE_NAME,
} from "../../context/JobSearch/infrastructure/BullMQJobSearchScheduler";
import { JobMinNotificationRating } from "../../context/Shared/domain/JobMinNotificationRating";
import { JobPremise } from "../../context/Shared/domain/JobPremise";
import { JobSearchFilter } from "../../context/Shared/domain/JobSearchFilter";
import type { Logger } from "../../context/Shared/domain/Logger";
import type { AppConfig } from "./config";

export type JobSearchScrapePayload = {
	jobSearchId: string;
	premise: string;
	filter: string;
	datePostedPeriod: "24h" | "week" | "month";
	minNotificationRating: number;
};

export const JOB_SEARCH_SCRAPE_DEAD_LETTER_QUEUE_NAME =
	"job-search-scrape-dead-letter";
export const JOB_SEARCH_SCRAPE_DEAD_LETTER_JOB_NAME =
	"job-search-scrape.dead-letter";

export type JobSearchScrapeDeadLetterPayload = {
	originalJobId: string;
	originalJobName: string;
	originalPayload: JobSearchScrapePayload;
	attemptsMade: number;
	maxAttempts: number;
	error: string;
	failedAt: string;
};

export const createJobSearchScrapeDeadLetterQueue = ({
	config,
}: {
	config: AppConfig;
}): Queue<JobSearchScrapeDeadLetterPayload> => {
	return new Queue<JobSearchScrapeDeadLetterPayload>(
		JOB_SEARCH_SCRAPE_DEAD_LETTER_QUEUE_NAME,
		{
			connection: config.redisConnection,
		},
	);
};

export const createJobSearchScrapeWorker = ({
	config,
	jobOffersGetLatest,
	logger,
	deadLetterQueue,
}: {
	config: AppConfig;
	jobOffersGetLatest: JobOffersGetLatest;
	logger: Logger;
	deadLetterQueue: Queue<JobSearchScrapeDeadLetterPayload>;
}): Worker<JobSearchScrapePayload> => {
	const worker = new Worker<JobSearchScrapePayload>(
		JOB_SEARCH_SCRAPE_QUEUE_NAME,
		async (job) => {
			if (job.name !== JOB_SEARCH_SCRAPE_JOB_NAME) return;
			const startedAt = Date.now();
			logger.info("JobSearchScrapeWorker - process - Processing job", {
				jobId: job.id,
				name: job.name,
				jobSearchId: job.data.jobSearchId,
				datePostedPeriod: job.data.datePostedPeriod,
			});

			try {
				await jobOffersGetLatest.run({
					jobSearchId: new JobSearchId(job.data.jobSearchId),
					premise: new JobPremise(job.data.premise),
					searchFilter: new JobSearchFilter(job.data.filter),
					datePostedPeriod: new JobOfferDatePostedPeriod(
						job.data.datePostedPeriod,
					),
					minNotificationRating: new JobMinNotificationRating(
						job.data.minNotificationRating,
					),
				});

				logger.info("JobSearchScrapeWorker - process - Job completed", {
					jobId: job.id,
					name: job.name,
					durationMs: Date.now() - startedAt,
				});
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Unknown error";
				logger.error("JobSearchScrapeWorker - process - Job execution failed", {
					jobId: job.id,
					name: job.name,
					error: message,
					durationMs: Date.now() - startedAt,
				});
				throw error;
			}
		},
		{ connection: config.redisConnection },
	);

	worker.on("failed", async (job, error) => {
		logger.error("JobSearchScrapeWorker - failed - Job failed", {
			jobId: job?.id,
			name: job?.name,
			error: error.message,
		});

		if (!job?.id || !job.data) {
			return;
		}

		const maxAttempts =
			typeof job.opts.attempts === "number" ? job.opts.attempts : 1;
		const isExhausted = job.attemptsMade >= maxAttempts;

		if (!isExhausted) {
			return;
		}

		const failedAt = new Date().toISOString();

		await deadLetterQueue.add(
			JOB_SEARCH_SCRAPE_DEAD_LETTER_JOB_NAME,
			{
				originalJobId: String(job.id),
				originalJobName: job.name,
				originalPayload: job.data,
				attemptsMade: job.attemptsMade,
				maxAttempts,
				error: error.message,
				failedAt,
			},
			{
				removeOnComplete: true,
				removeOnFail: false,
			},
		);

		logger.error("JobSearchScrapeWorker - failed - Routed to dead-letter", {
			jobId: job.id,
			attemptsMade: job.attemptsMade,
			maxAttempts,
			deadLetterQueue: JOB_SEARCH_SCRAPE_DEAD_LETTER_QUEUE_NAME,
		});
	});

	return worker;
};
