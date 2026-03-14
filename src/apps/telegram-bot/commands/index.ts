import type { Queue } from "bullmq";
import type TelegramBot from "node-telegram-bot-api";
import type { JobScoredFinderAll } from "../../../context/JobScored/application/JobScoredFinderAll";
import type { JobScoredFinderBySearch } from "../../../context/JobScored/application/JobScoredFinderBySearch";
import type { JobSearchDelete } from "../../../context/JobSearch/application/JobSearchDelete";
import type { JobSearchDeleteAll } from "../../../context/JobSearch/application/JobSearchDeleteAll";
import type { JobSearchFinderAll } from "../../../context/JobSearch/application/JobSearchFinderAll";
import type { JobSearchPremiseAnalyze } from "../../../context/JobSearch/application/JobSearchPremiseAnalyze";
import type { Logger } from "../../../context/Shared/domain/Logger";
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
import { SetProfileWizardCommand } from "./set-profile";
import { SetProfileCommentCommand } from "./set-profile-comment";

const UNKNOWN_COMMAND_MESSAGE =
	"Unknown command. Use /help to see available commands.";
const PRIVATE_BOT_MESSAGE =
	"This bot is private and self-hosted. To use it, deploy your own instance and check the project's GitHub repository.";

export type TelegramCommandDependencies = {
	telegramBot: TelegramBot;
	logger: Logger;
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
	logger,
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
		new HelpCommand({ telegramBot, logger }),
		new SetProfileCommentCommand({
			telegramBot,
			logger,
			userProfileFinder,
			userProfileUpsert,
		}),
		new ProfileCommand({ telegramBot, logger, userProfileFinder }),
		new DeleteProfileCommand({ telegramBot, logger, userProfileDelete }),
		new CreateSearchCommand({ telegramBot, logger, jobSearchPremiseAnalyze }),
		new SearchesCommand({ telegramBot, logger, jobSearchFinderAll }),
		new ScoredCommand({ telegramBot, logger, jobScoredFinderAll }),
		new ScoredSearchCommand({
			telegramBot,
			logger,
			jobScoredFinderBySearch,
		}),
		new DeleteSearchCommand({ telegramBot, logger, jobSearchDelete }),
		new DeleteAllSearchesCommand({
			telegramBot,
			logger,
			jobSearchDeleteAll,
		}),
		new DlqCommand({ telegramBot, logger, deadLetterQueue }),
	];
}

export function registerTelegramCommands({
	...dependencies
}: TelegramCommandDependencies): void {
	const { telegramBot, allowedChatIds } = dependencies;
	const commands = buildTelegramCommands(dependencies);
	const setProfileWizard = new SetProfileWizardCommand({
		telegramBot,
		userProfileUpsert: dependencies.userProfileUpsert,
	});

	telegramBot.on("message", async (message) => {
		const chatId = message.chat.id;
		const text = message.text;
		const receivedChatId = String(chatId);

		if (typeof text !== "string") {
			return;
		}

		const formattedText = text.trim();
		if (formattedText.length === 0) {
			return;
		}

		const isAuthorized = allowedChatIds.includes(receivedChatId);
		if (!isAuthorized) {
			await telegramBot.sendMessage(chatId, PRIVATE_BOT_MESSAGE);
			return;
		}

		const wasSetProfileWizardHandled = await setProfileWizard.handle({
			chatId,
			text: formattedText,
		});
		if (wasSetProfileWizardHandled) {
			return;
		}

		if (!formattedText.startsWith("/")) {
			return;
		}

		for (const command of commands) {
			if (!command.matches(formattedText)) {
				continue;
			}

			await command.execute({ chatId, text: formattedText });

			return;
		}

		await telegramBot.sendMessage(chatId, UNKNOWN_COMMAND_MESSAGE);
	});
}
