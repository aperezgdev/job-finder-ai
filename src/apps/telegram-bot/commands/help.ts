import type TelegramBot from "node-telegram-bot-api";
import { TelegramCommand, type TelegramCommandRunContext } from "./command";

const HELP_COMMAND = /^\/help(?:@\w+)?\b/i;

const HELP_MESSAGE = [
	"Available commands:",
	"",
	"/help",
	"Show all available commands.",
	"",
	"/createSearch {premise} {periodicity} {scheduledAtUtcHour} {minimumRatingToNotify}",
	"Create a job search.",
	"Valid periodicity: daily, weekly, biweekly, monthly.",
	"Valid scheduled UTC hour: HH:mm (24h), for example 09:30.",
	"Valid minimum rating: from 3 to 5 in 0.5 steps.",
	"",
	"/searches",
	"List all scheduled job searches.",
	"",
	"/scored",
	"List all scored jobs.",
	"",
	"/scoredSearch {jobSearchId}",
	"List scored jobs for one specific search.",
	"",
	"/deleteSearch {jobSearchId}",
	"Delete one job search and unschedule its job.",
	"",
	"/deleteSearchAll",
	"Delete all job searches and unschedule all jobs.",
	"",
	"/dlq [limit]",
	"List dead-letter jobs (default 10, max 30).",
].join("\n");

export class HelpCommand extends TelegramCommand {
	constructor(telegramBot: TelegramBot) {
		super(HELP_COMMAND, telegramBot);
	}

	protected async run({ chatId }: TelegramCommandRunContext): Promise<void> {
		await this.telegramBot.sendMessage(chatId, HELP_MESSAGE);
	}
}
