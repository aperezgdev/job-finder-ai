import { PinoLogger } from "../../context/Shared/infrastructure/PinoLogger";
import { registerTelegramCommands } from "./commands";
import { getAppConfig } from "./config";
import { createTelegramBotContainer } from "./dependency-injection";

const config = getAppConfig();
const bootstrapLogger = new PinoLogger(config.logLevel);

async function main(): Promise<void> {
	const container = await createTelegramBotContainer(config);
	const {
		worker,
		deadLetterQueue,
		dataSource,
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
		rateJobScoredOnOfferCreated,
		logger,
	} = container.cradle;

	registerTelegramCommands({
		telegramBot,
		logger,
		allowedChatIds: config.telegram.allowedChatIds,
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
	});

	const shutdown = async () => {
		logger.info("TelegramBotBootstrap - shutdown - Closing resources");
		await rateJobScoredOnOfferCreated.flushPending();
		await worker.close();
		await deadLetterQueue.close();
		if (telegramBot) {
			await telegramBot.stopPolling();
		}
		await dataSource.destroy();
		logger.info("TelegramBotBootstrap - shutdown - Resources closed");
		process.exit(0);
	};

	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
}

main().catch((error) => {
	bootstrapLogger.error(
		"TelegramBotBootstrap - main - Fatal bootstrap error",
		error,
	);
	process.exit(1);
});
