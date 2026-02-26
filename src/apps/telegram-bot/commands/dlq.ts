import type { Queue } from "bullmq";
import type TelegramBot from "node-telegram-bot-api";
import type { JobSearchScrapeDeadLetterPayload } from "../workers";
import {
	TelegramCommandWithArgs,
	type TypedTelegramCommandRunContext,
} from "./command";

const DLQ_COMMAND = /^\/dlq(?:@\w+)?\b/i;
const DLQ_TEMPLATE = "/dlq {limit}";

const TELEGRAM_MAX_MESSAGE_LENGTH = 4000;
const DLQ_EMPTY_MESSAGE = "Dead-letter queue is empty.";
const DLQ_GENERIC_ERROR_MESSAGE =
	"Unable to list dead-letter jobs right now. Please try again later.";

function truncate(text: string, max: number): string {
	if (text.length <= max) return text;
	return `${text.slice(0, max - 3)}...`;
}

function formatDlqLine(
	payload: JobSearchScrapeDeadLetterPayload,
	deadLetterId: string,
	index: number,
): string {
	return [
		`${index + 1}. ${deadLetterId}`,
		`   - Original job: ${payload.originalJobId}`,
		`   - Search id: ${payload.originalPayload.jobSearchId}`,
		`   - Attempts: ${payload.attemptsMade}/${payload.maxAttempts}`,
		`   - Failed at: ${payload.failedAt}`,
		`   - Error: ${truncate(payload.error, 180)}`,
	].join("\n");
}

function buildDlqMessages(
	jobs: Array<{
		id?: string | number;
		data: JobSearchScrapeDeadLetterPayload;
	}>,
): Array<string> {
	const header = `Dead-letter jobs (showing ${jobs.length}):`;
	const messages: Array<string> = [];
	let currentMessage = header;

	for (const [index, job] of jobs.entries()) {
		const line = formatDlqLine(job.data, String(job.id), index);
		const candidate = `${currentMessage}\n${line}`;

		if (candidate.length <= TELEGRAM_MAX_MESSAGE_LENGTH) {
			currentMessage = candidate;
			continue;
		}

		messages.push(currentMessage);
		currentMessage = `${header} (cont.)\n${line}`;
	}

	messages.push(currentMessage);
	return messages;
}

export class DlqCommand extends TelegramCommandWithArgs<{ limit: number }> {
	constructor(
		private readonly dependencies: {
			telegramBot: TelegramBot;
			deadLetterQueue: Queue<JobSearchScrapeDeadLetterPayload>;
		},
	) {
		super(DLQ_COMMAND, dependencies.telegramBot);
	}

	protected commandTemplate(): string {
		return DLQ_TEMPLATE;
	}

	protected async run({
		chatId,
		args,
	}: TypedTelegramCommandRunContext<{ limit: number }>): Promise<void> {
		const jobs = await this.dependencies.deadLetterQueue.getJobs(
			["waiting", "delayed", "active", "failed"],
			0,
			args.limit - 1,
			false,
		);

		if (jobs.length === 0) {
			await this.dependencies.telegramBot.sendMessage(
				chatId,
				DLQ_EMPTY_MESSAGE,
			);
			return;
		}

		const messages = buildDlqMessages(
			jobs.map((job) => ({
				id: job.id,
				data: job.data,
			})),
		);

		for (const message of messages) {
			await this.dependencies.telegramBot.sendMessage(chatId, message);
		}
	}

	protected genericErrorMessage(): string {
		return DLQ_GENERIC_ERROR_MESSAGE;
	}
}
