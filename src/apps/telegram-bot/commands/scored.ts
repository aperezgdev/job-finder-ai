import type TelegramBot from "node-telegram-bot-api";
import type { JobScoredFinderAll } from "../../../context/JobScored/application/JobScoredFinderAll";
import type { JobScoredFinderBySearch } from "../../../context/JobScored/application/JobScoredFinderBySearch";
import type { JobScoredSummary } from "../../../context/JobScored/domain/JobScoredRepository";
import {
	TelegramCommand,
	TelegramCommandWithArgs,
	type TypedTelegramCommandRunContext,
} from "./command";

const SCORED_COMMAND = /^\/scored(?:@\w+)?\b/i;
const SCORED_SEARCH_COMMAND = /^\/scoredSearch(?:@\w+)?\b/i;
const SCORED_SEARCH_TEMPLATE = "/scoredSearch {jobSearchId}";

const TELEGRAM_MAX_MESSAGE_LENGTH = 4000;
const NO_SCORED_JOBS_MESSAGE = "No scored jobs found.";
const SCORED_GENERIC_ERROR_MESSAGE =
	"Unable to list scored jobs right now. Please try again later.";

function formatScoredLine(jobScored: JobScoredSummary, index: number): string {
	return [
		`${index + 1}. [${jobScored.rating}] ${jobScored.title} (${jobScored.company})`,
		`   - Job offer id: ${jobScored.jobOfferId}`,
		`   - Link: ${jobScored.link}`,
	].join("\n");
}

function buildScoredJobsMessages(
	header: string,
	jobScoreds: Array<JobScoredSummary>,
): Array<string> {
	const messages: Array<string> = [];
	let currentMessage = header;

	for (const [index, jobScored] of jobScoreds.entries()) {
		const scoredLine = formatScoredLine(jobScored, index);
		const messageCandidate = `${currentMessage}\n${scoredLine}`;

		if (messageCandidate.length <= TELEGRAM_MAX_MESSAGE_LENGTH) {
			currentMessage = messageCandidate;
			continue;
		}

		messages.push(currentMessage);
		currentMessage = `${header} (cont.)\n${scoredLine}`;
	}

	messages.push(currentMessage);

	return messages;
}

async function sendScoredJobsMessages({
	telegramBot,
	chatId,
	header,
	jobScoreds,
}: {
	telegramBot: TelegramBot;
	chatId: number;
	header: string;
	jobScoreds: Array<JobScoredSummary>;
}): Promise<void> {
	const messages = buildScoredJobsMessages(header, jobScoreds);

	for (const message of messages) {
		await telegramBot.sendMessage(chatId, message);
	}
}

export class ScoredCommand extends TelegramCommand {
	constructor(
		private readonly dependencies: {
			telegramBot: TelegramBot;
			jobScoredFinderAll: JobScoredFinderAll;
		},
	) {
		super(SCORED_COMMAND, dependencies.telegramBot);
	}

	protected async run({
		chatId,
	}: TypedTelegramCommandRunContext<Record<string, never>>): Promise<void> {
		try {
			const jobScoreds = await this.dependencies.jobScoredFinderAll.run({
				chatId: String(chatId),
			});
			if (jobScoreds.length === 0) {
				await this.dependencies.telegramBot.sendMessage(
					chatId,
					NO_SCORED_JOBS_MESSAGE,
				);
				return;
			}

			await sendScoredJobsMessages({
				telegramBot: this.dependencies.telegramBot,
				chatId,
				header: "Scored jobs:",
				jobScoreds,
			});
		} catch (_error) {
			await this.dependencies.telegramBot.sendMessage(
				chatId,
				SCORED_GENERIC_ERROR_MESSAGE,
			);
		}
	}
}

export class ScoredSearchCommand extends TelegramCommandWithArgs<{
	jobSearchId: string;
}> {
	constructor(
		private readonly dependencies: {
			telegramBot: TelegramBot;
			jobScoredFinderBySearch: JobScoredFinderBySearch;
		},
	) {
		super(SCORED_SEARCH_COMMAND, dependencies.telegramBot);
	}

	protected commandTemplate(): string {
		return SCORED_SEARCH_TEMPLATE;
	}

	protected async run({
		chatId,
		args,
	}: TypedTelegramCommandRunContext<{ jobSearchId: string }>): Promise<void> {
		const { jobSearchId } = args;
		const jobScoreds = await this.dependencies.jobScoredFinderBySearch.run({
			jobSearchId,
			chatId: String(chatId),
		});

		if (jobScoreds.length === 0) {
			await this.dependencies.telegramBot.sendMessage(
				chatId,
				`No scored jobs found for search ${jobSearchId}.`,
			);
			return;
		}

		await sendScoredJobsMessages({
			telegramBot: this.dependencies.telegramBot,
			chatId,
			header: `Scored jobs for search ${jobSearchId}:`,
			jobScoreds,
		});
	}

	protected genericErrorMessage(): string {
		return SCORED_GENERIC_ERROR_MESSAGE;
	}
}
