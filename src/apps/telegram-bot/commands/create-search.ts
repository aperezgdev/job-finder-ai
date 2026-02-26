import type TelegramBot from "node-telegram-bot-api";
import type { JobSearchPremiseAnalyze } from "../../../context/JobSearch/application/JobSearchPremiseAnalyze";
import type { TypedTelegramCommandRunContext } from "./command";
import { TelegramCommandWithArgs } from "./command";

const CREATE_SEARCH_COMMAND = /^\/createSearch(?:@\w+)?\b/i;
const CREATE_SEARCH_TEMPLATE =
	"/createSearch {premise} {periodicity} {scheduledAtUtcHour} {minNotificationRating}";

export class CreateSearchCommand extends TelegramCommandWithArgs<{
	premise: string;
	periodicity: string;
	scheduledAtUtcHour: string;
	minNotificationRating: string;
}> {
	constructor(
		private readonly dependencies: {
			telegramBot: TelegramBot;
			jobSearchPremiseAnalyze: JobSearchPremiseAnalyze;
		},
	) {
		super(CREATE_SEARCH_COMMAND, dependencies.telegramBot);
	}

	protected commandTemplate(): string {
		return CREATE_SEARCH_TEMPLATE;
	}

	protected async run({
		chatId,
		args,
	}: TypedTelegramCommandRunContext<{
		premise: string;
		periodicity: string;
		scheduledAtUtcHour: string;
		minNotificationRating: string;
	}>): Promise<void> {
		const minNotificationRating = Number(args.minNotificationRating);

		await this.dependencies.jobSearchPremiseAnalyze.run({
			premise: args.premise,
			periodicity: args.periodicity,
			scheduledAtUtcHour: args.scheduledAtUtcHour,
			minNotificationRating,
		});

		await this.dependencies.telegramBot.sendMessage(
			chatId,
			"Job search created successfully.",
		);
	}

	protected genericErrorMessage(): string {
		return "Unable to create job search. Please check the command format.";
	}
}
