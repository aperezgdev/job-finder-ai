import type TelegramBot from "node-telegram-bot-api";
import type { JobSearchFinderAll } from "../../../context/JobSearch/application/JobSearchFinderAll";
import type { JobSearch } from "../../../context/JobSearch/domain/JobSearch";
import type { TelegramCommandRunContext } from "./command";
import { TelegramCommand } from "./command";

const SEARCHES_COMMAND = /^\/searches(?:@\w+)?\b/i;

const NO_SCHEDULED_SEARCHES_MESSAGE = "No scheduled job searches found.";

function formatScheduledSearchesMessage(jobSearches: Array<JobSearch>): string {
	const lines = jobSearches.flatMap((jobSearch, index) => {
		const {
			id,
			premise,
			periodicity,
			scheduledAtUtcHour,
			minNotificationRating,
		} = jobSearch.toPrimitives();

		return [
			`${index + 1}. ${premise}`,
			`   - Id: ${id}`,
			`   - Periodicity: ${periodicity}`,
			`   - Scheduled at (UTC): ${scheduledAtUtcHour}`,
			`   - Min rating to notify: ${minNotificationRating}`,
		];
	});

	return ["Scheduled job searches:", ...lines].join("\n");
}

export class SearchesCommand extends TelegramCommand {
	constructor(
		private readonly dependencies: {
			telegramBot: TelegramBot;
			jobSearchFinderAll: JobSearchFinderAll;
		},
	) {
		super(SEARCHES_COMMAND, dependencies.telegramBot);
	}

	protected async run({ chatId }: TelegramCommandRunContext): Promise<void> {
		const jobSearches = await this.dependencies.jobSearchFinderAll.run();

		if (jobSearches.length === 0) {
			await this.dependencies.telegramBot.sendMessage(
				chatId,
				NO_SCHEDULED_SEARCHES_MESSAGE,
			);
			return;
		}

		await this.dependencies.telegramBot.sendMessage(
			chatId,
			formatScheduledSearchesMessage(jobSearches),
		);
	}
}
