import type { Queue } from "bullmq";
import type TelegramBot from "node-telegram-bot-api";
import type { JobScoredFinderAll } from "../../../context/JobScored/application/JobScoredFinderAll";
import type { JobScoredFinderBySearch } from "../../../context/JobScored/application/JobScoredFinderBySearch";
import type { JobSearchDelete } from "../../../context/JobSearch/application/JobSearchDelete";
import type { JobSearchDeleteAll } from "../../../context/JobSearch/application/JobSearchDeleteAll";
import type { JobSearchFinderAll } from "../../../context/JobSearch/application/JobSearchFinderAll";
import type { JobSearchPremiseAnalyze } from "../../../context/JobSearch/application/JobSearchPremiseAnalyze";
import type { UserProfileDelete } from "../../../context/UserProfile/application/UserProfileDelete";
import type { UserProfileFinder } from "../../../context/UserProfile/application/UserProfileFinder";
import type { UserProfileUpsert } from "../../../context/UserProfile/application/UserProfileUpsert";
import type { JobSearchScrapeDeadLetterPayload } from "../workers";
import type { TelegramCommand } from "./command";
import { CreateSearchCommand } from "./create-search";
import { DeleteProfileCommand } from "./delete-profile";
import { DeleteAllSearchesCommand, DeleteSearchCommand } from "./delete-search";
import { DlqCommand } from "./dlq";
import { HelpCommand } from "./help";
import { ProfileCommand } from "./profile";
import { ScoredCommand, ScoredSearchCommand } from "./scored";
import { SearchesCommand } from "./searches";
import { SetProfileCommand } from "./set-profile";
import { SetProfileCommentCommand } from "./set-profile-comment";

const UNKNOWN_COMMAND_MESSAGE =
	"Unknown command. Use /help to see available commands.";
const PRIVATE_BOT_MESSAGE =
	"This bot is private and self-hosted. To use it, deploy your own instance and check the project's GitHub repository.";

export type TelegramCommandDependencies = {
	telegramBot: TelegramBot;
	allowedChatIds: string[];
	jobSearchPremiseAnalyze: JobSearchPremiseAnalyze;
	jobSearchFinderAll: JobSearchFinderAll;
	jobSearchDelete: JobSearchDelete;
	jobSearchDeleteAll: JobSearchDeleteAll;
	jobScoredFinderAll: JobScoredFinderAll;
	jobScoredFinderBySearch: JobScoredFinderBySearch;
	userProfileUpsert: UserProfileUpsert;
	userProfileFinder: UserProfileFinder;
	userProfileDelete: UserProfileDelete;
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
	userProfileUpsert,
	userProfileFinder,
	userProfileDelete,
	deadLetterQueue,
}: TelegramCommandDependencies): Array<TelegramCommand> {
	return [
		new HelpCommand(telegramBot),
		new SetProfileCommand({ telegramBot, userProfileUpsert }),
		new SetProfileCommentCommand({
			telegramBot,
			userProfileFinder,
			userProfileUpsert,
		}),
		new ProfileCommand({ telegramBot, userProfileFinder }),
		new DeleteProfileCommand({ telegramBot, userProfileDelete }),
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
	const { telegramBot, allowedChatIds } = dependencies;
	const commands = buildTelegramCommands(dependencies);

	telegramBot.on("message", async (message) => {
		const chatId = message.chat.id;
		const text = message.text;
		const receivedChatId = String(chatId);

		if (typeof text !== "string") {
			return;
		}

		if (!text.trim().startsWith("/")) {
			return;
		}

		if (!allowedChatIds.includes(receivedChatId)) {
			await telegramBot.sendMessage(chatId, PRIVATE_BOT_MESSAGE);
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
