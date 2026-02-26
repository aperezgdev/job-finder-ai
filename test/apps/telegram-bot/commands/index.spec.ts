import { registerTelegramCommands } from "../../../../src/apps/telegram-bot/commands";

describe("registerTelegramCommands", () => {
	function setup() {
		let messageHandler:
			| ((message: { chat: { id: number }; text?: string }) => Promise<void>)
			| undefined;

		const telegramBot = {
			sendMessage: jest.fn().mockResolvedValue(undefined),
			on: jest.fn((event: string, handler: typeof messageHandler) => {
				if (event === "message") {
					messageHandler = handler;
				}
			}),
		};

		const jobSearchPremiseAnalyze = {
			run: jest.fn().mockResolvedValue(undefined),
		};
		const jobSearchFinderAll = {
			run: jest.fn().mockResolvedValue([]),
		};
		const jobSearchDelete = {
			run: jest.fn().mockResolvedValue(undefined),
		};
		const jobSearchDeleteAll = {
			run: jest.fn().mockResolvedValue(0),
		};
		const jobScoredFinderAll = {
			run: jest.fn().mockResolvedValue([]),
		};
		const jobScoredFinderBySearch = {
			run: jest.fn().mockResolvedValue([]),
		};
		const deadLetterQueue = {
			getJobs: jest.fn().mockResolvedValue([]),
		};

		registerTelegramCommands({
			telegramBot: telegramBot as never,
			jobSearchPremiseAnalyze: jobSearchPremiseAnalyze as never,
			jobSearchFinderAll: jobSearchFinderAll as never,
			jobSearchDelete: jobSearchDelete as never,
			jobSearchDeleteAll: jobSearchDeleteAll as never,
			jobScoredFinderAll: jobScoredFinderAll as never,
			jobScoredFinderBySearch: jobScoredFinderBySearch as never,
			deadLetterQueue: deadLetterQueue as never,
		});

		expect(telegramBot.on).toHaveBeenCalledWith(
			"message",
			expect.any(Function),
		);
		expect(messageHandler).toBeDefined();

		return {
			messageHandler,
			telegramBot,
			jobSearchPremiseAnalyze,
			jobSearchFinderAll,
			jobSearchDelete,
			jobSearchDeleteAll,
			jobScoredFinderAll,
			jobScoredFinderBySearch,
			deadLetterQueue,
		};
	}

	it("ignores messages without text", async () => {
		const { messageHandler, telegramBot, jobSearchPremiseAnalyze } = setup();

		await expect(
			messageHandler?.({ chat: { id: 123 } }),
		).resolves.toBeUndefined();

		expect(telegramBot.sendMessage).not.toHaveBeenCalled();
		expect(jobSearchPremiseAnalyze.run).not.toHaveBeenCalled();
	});

	it("ignores plain text without slash prefix", async () => {
		const { messageHandler, telegramBot, jobSearchFinderAll } = setup();

		await expect(
			messageHandler?.({ chat: { id: 123 }, text: "hola que tal" }),
		).resolves.toBeUndefined();

		expect(telegramBot.sendMessage).not.toHaveBeenCalled();
		expect(jobSearchFinderAll.run).not.toHaveBeenCalled();
	});

	it("responds to unknown slash command", async () => {
		const {
			messageHandler,
			telegramBot,
			jobSearchPremiseAnalyze,
			jobSearchFinderAll,
			jobSearchDelete,
			jobSearchDeleteAll,
			jobScoredFinderAll,
			jobScoredFinderBySearch,
			deadLetterQueue,
		} = setup();

		await expect(
			messageHandler?.({ chat: { id: 123 }, text: "/comandoInexistente" }),
		).resolves.toBeUndefined();

		expect(telegramBot.sendMessage).toHaveBeenCalledTimes(1);
		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			"Unknown command. Use /help to see available commands.",
		);
		expect(jobSearchPremiseAnalyze.run).not.toHaveBeenCalled();
		expect(jobSearchFinderAll.run).not.toHaveBeenCalled();
		expect(jobSearchDelete.run).not.toHaveBeenCalled();
		expect(jobSearchDeleteAll.run).not.toHaveBeenCalled();
		expect(jobScoredFinderAll.run).not.toHaveBeenCalled();
		expect(jobScoredFinderBySearch.run).not.toHaveBeenCalled();
		expect(deadLetterQueue.getJobs).not.toHaveBeenCalled();
	});

	it("routes /help to help command", async () => {
		const { messageHandler, telegramBot } = setup();

		await expect(
			messageHandler?.({ chat: { id: 123 }, text: "/help" }),
		).resolves.toBeUndefined();

		expect(telegramBot.sendMessage).toHaveBeenCalledTimes(1);
		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			expect.stringContaining("Available commands:"),
		);
	});

	it("routes /createSearch and calls analyze use case with parsed args", async () => {
		const { messageHandler, jobSearchPremiseAnalyze, telegramBot } = setup();

		await expect(
			messageHandler?.({
				chat: { id: 123 },
				text: "/createSearch senior backend engineer weekly 09:30 4.5",
			}),
		).resolves.toBeUndefined();

		expect(jobSearchPremiseAnalyze.run).toHaveBeenCalledWith({
			premise: "senior backend engineer",
			periodicity: "weekly",
			scheduledAtUtcHour: "09:30",
			minNotificationRating: 4.5,
		});
		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			"Job search created successfully.",
		);
	});

	it("routes /dlq and forwards parsed limit to queue", async () => {
		const { messageHandler, deadLetterQueue, telegramBot } = setup();

		await expect(
			messageHandler?.({ chat: { id: 123 }, text: "/dlq 3" }),
		).resolves.toBeUndefined();

		expect(deadLetterQueue.getJobs).toHaveBeenCalledWith(
			["waiting", "delayed", "active", "failed"],
			0,
			2,
			false,
		);
		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			"Dead-letter queue is empty.",
		);
	});
});
