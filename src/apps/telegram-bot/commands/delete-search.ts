import type TelegramBot from "node-telegram-bot-api";
import type { JobSearchDelete } from "../../../context/JobSearch/application/JobSearchDelete";
import type { JobSearchDeleteAll } from "../../../context/JobSearch/application/JobSearchDeleteAll";
import type { Logger } from "../../../context/Shared/domain/Logger";
import {
	TelegramCommand,
	type TelegramCommandRunContext,
	TelegramCommandWithArgs,
	type TypedTelegramCommandRunContext,
} from "./command";

const DELETE_SEARCH_COMMAND = /^\/deleteSearch(?:@\w+)?\b/i;
const DELETE_ALL_SEARCHES_COMMAND = /^\/deleteSearchAll(?:@\w+)?\b/i;
const DELETE_SEARCH_TEMPLATE = "/deleteSearch {jobSearchId}";

export class DeleteSearchCommand extends TelegramCommandWithArgs<{
	jobSearchId: string;
}> {
	constructor(
		private readonly dependencies: {
			telegramBot: TelegramBot;
			logger: Logger;
			jobSearchDelete: JobSearchDelete;
		},
	) {
		super(DELETE_SEARCH_COMMAND, dependencies.telegramBot, dependencies.logger);
	}

	protected commandTemplate(): string {
		return DELETE_SEARCH_TEMPLATE;
	}

	protected async run({
		chatId,
		args,
	}: TypedTelegramCommandRunContext<{ jobSearchId: string }>): Promise<void> {
		await this.dependencies.jobSearchDelete.run({
			jobSearchId: args.jobSearchId,
			chatId: String(chatId),
		});
		await this.dependencies.telegramBot.sendMessage(
			chatId,
			"Job search deleted successfully.",
		);
	}

	protected genericErrorMessage(): string {
		return "Unable to delete job search. Please check the command format.";
	}
}

export class DeleteAllSearchesCommand extends TelegramCommand {
	constructor(
		private readonly dependencies: {
			telegramBot: TelegramBot;
			logger: Logger;
			jobSearchDeleteAll: JobSearchDeleteAll;
		},
	) {
		super(
			DELETE_ALL_SEARCHES_COMMAND,
			dependencies.telegramBot,
			dependencies.logger,
		);
	}

	protected async run({ chatId }: TelegramCommandRunContext): Promise<void> {
		const deletedCount = await this.dependencies.jobSearchDeleteAll.run({
			chatId: String(chatId),
		});
		await this.dependencies.telegramBot.sendMessage(
			chatId,
			`Deleted ${deletedCount} scheduled job search(es).`,
		);
	}
}
