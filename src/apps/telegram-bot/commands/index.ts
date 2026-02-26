import type { Queue } from "bullmq";
import type TelegramBot from "node-telegram-bot-api";
import type { JobScoredFinderAll } from "../../../context/JobScored/application/JobScoredFinderAll";
import type { JobScoredFinderBySearch } from "../../../context/JobScored/application/JobScoredFinderBySearch";
import type { JobSearchDelete } from "../../../context/JobSearch/application/JobSearchDelete";
import type { JobSearchDeleteAll } from "../../../context/JobSearch/application/JobSearchDeleteAll";
import type { JobSearchFinderAll } from "../../../context/JobSearch/application/JobSearchFinderAll";
import type { JobSearchPremiseAnalyze } from "../../../context/JobSearch/application/JobSearchPremiseAnalyze";
import type { JobSearchScrapeDeadLetterPayload } from "../workers";
import type { TelegramCommand } from "./command";
import { CreateSearchCommand } from "./create-search";
import { DeleteAllSearchesCommand, DeleteSearchCommand } from "./delete-search";
import { DlqCommand } from "./dlq";
import { HelpCommand } from "./help";
import { ScoredCommand, ScoredSearchCommand } from "./scored";
import { SearchesCommand } from "./searches";

const UNKNOWN_COMMAND_MESSAGE =
	"Unknown command. Use /help to see available commands.";

export type TelegramCommandDependencies = {
	telegramBot: TelegramBot;
	jobSearchPremiseAnalyze: JobSearchPremiseAnalyze;
	jobSearchFinderAll: JobSearchFinderAll;
	jobSearchDelete: JobSearchDelete;
	jobSearchDeleteAll: JobSearchDeleteAll;
	jobScoredFinderAll: JobScoredFinderAll;
	jobScoredFinderBySearch: JobScoredFinderBySearch;
	deadLetterQueue: Queue<JobSearchScrapeDeadLetterPayload>;
};

function buildTelegramCommands({
	telegramBot,
	jobSearchPremiseAnalyze,
	jobSearchFinderAll,
	jobSearchDelete,
	jobSearchDeleteAll,
	jobScoredFinderAll,
	jobScoredFinderBySearch,
	deadLetterQueue,
}: TelegramCommandDependencies): Array<TelegramCommand> {
	return [
		new HelpCommand(telegramBot),
		new CreateSearchCommand({ telegramBot, jobSearchPremiseAnalyze }),
		new SearchesCommand({ telegramBot, jobSearchFinderAll }),
		new ScoredCommand({ telegramBot, jobScoredFinderAll }),
		new ScoredSearchCommand({ telegramBot, jobScoredFinderBySearch }),
		new DeleteSearchCommand({ telegramBot, jobSearchDelete }),
		new DeleteAllSearchesCommand({ telegramBot, jobSearchDeleteAll }),
		new DlqCommand({ telegramBot, deadLetterQueue }),
	];
}

export function registerTelegramCommands({
	...dependencies
}: TelegramCommandDependencies): void {
	const { telegramBot } = dependencies;
	const commands = buildTelegramCommands(dependencies);

	telegramBot.on("message", async (message) => {
		const chatId = message.chat.id;
		const text = message.text;

		if (typeof text !== "string") {
			return;
		}

		if (!text.trim().startsWith("/")) {
			return;
		}

		for (const command of commands) {
			if (!command.matches(text)) {
				continue;
			}

			await command.execute({ chatId, text });

			return;
		}

		await telegramBot.sendMessage(chatId, UNKNOWN_COMMAND_MESSAGE);
	});
}
