import { registerTelegramCommands } from "../../../../src/apps/telegram-bot/commands";
import {
	SET_PROFILE_WIZARD_ACTIVE_COMMAND_BLOCK_MESSAGE,
	SET_PROFILE_WIZARD_CANCELLED_MESSAGE,
	SET_PROFILE_WIZARD_EXPIRED_MESSAGE,
	SET_PROFILE_WIZARD_TIMEOUT_MS,
} from "../../../../src/apps/telegram-bot/commands/set-profile";

describe("registerTelegramCommands", () => {
	function setup({
		allowedChatIds = ["123"],
	}: {
		allowedChatIds?: string[];
	} = {}) {
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
		const userProfileUpsert = {
			run: jest.fn().mockResolvedValue(undefined),
		};
		const userProfileFinder = {
			run: jest.fn().mockResolvedValue(null),
		};
		const userProfileDelete = {
			run: jest.fn().mockResolvedValue(undefined),
		};
		const deadLetterQueue = {
			getJobs: jest.fn().mockResolvedValue([]),
		};

		registerTelegramCommands({
			telegramBot: telegramBot as never,
			allowedChatIds,
			jobSearchPremiseAnalyze: jobSearchPremiseAnalyze as never,
			jobSearchFinderAll: jobSearchFinderAll as never,
			jobSearchDelete: jobSearchDelete as never,
			jobSearchDeleteAll: jobSearchDeleteAll as never,
			jobScoredFinderAll: jobScoredFinderAll as never,
			jobScoredFinderBySearch: jobScoredFinderBySearch as never,
			userProfileUpsert: userProfileUpsert as never,
			userProfileFinder: userProfileFinder as never,
			userProfileDelete: userProfileDelete as never,
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
			userProfileUpsert,
			userProfileFinder,
			userProfileDelete,
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

	it("starts /setProfile guided flow", async () => {
		const { messageHandler, telegramBot, userProfileUpsert } = setup();

		await expect(
			messageHandler?.({ chat: { id: 123 }, text: "/setProfile" }),
		).resolves.toBeUndefined();

		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			expect.stringContaining("Step 1/10"),
		);
		expect(userProfileUpsert.run).not.toHaveBeenCalled();
	});

	it("completes /setProfile guided flow and persists profile", async () => {
		const { messageHandler, telegramBot, userProfileUpsert } = setup();

		await messageHandler?.({ chat: { id: 123 }, text: "/setProfile" });
		await messageHandler?.({ chat: { id: 123 }, text: "backend engineer" });
		await messageHandler?.({ chat: { id: 123 }, text: "5" });
		await messageHandler?.({ chat: { id: 123 }, text: "salary,growth" });
		await messageHandler?.({ chat: { id: 123 }, text: "fintech" });
		await messageHandler?.({ chat: { id: 123 }, text: "staff engineer" });
		await messageHandler?.({ chat: { id: 123 }, text: "remote,hybrid" });
		await messageHandler?.({ chat: { id: 123 }, text: "senior,staff" });
		await messageHandler?.({ chat: { id: 123 }, text: "madrid,barcelona" });
		await messageHandler?.({ chat: { id: 123 }, text: "typescript,node.js" });
		await messageHandler?.({ chat: { id: 123 }, text: "none" });

		expect(userProfileUpsert.run).toHaveBeenCalledWith({
			chatId: "123",
			currentRole: "backend engineer",
			yearsExperience: 5,
			priorities: ["salary", "growth"],
			sectorExperience: ["fintech"],
			targetRoles: ["staff engineer"],
			targetWorkModes: ["remote", "hybrid"],
			targetSeniorities: ["senior", "staff"],
			targetLocations: ["madrid", "barcelona"],
			skills: ["typescript", "node.js"],
			minSalary: undefined,
		});
		expect(telegramBot.sendMessage).toHaveBeenLastCalledWith(
			123,
			"Candidate profile saved successfully.",
		);
	});

	it("cancels active /setProfile flow with /cancel", async () => {
		const { messageHandler, telegramBot, userProfileUpsert } = setup();

		await messageHandler?.({ chat: { id: 123 }, text: "/setProfile" });
		await messageHandler?.({ chat: { id: 123 }, text: "/cancel" });
		await messageHandler?.({ chat: { id: 123 }, text: "backend engineer" });

		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			SET_PROFILE_WIZARD_CANCELLED_MESSAGE,
		);
		expect(userProfileUpsert.run).not.toHaveBeenCalled();
	});

	it("blocks other slash commands while /setProfile flow is active", async () => {
		const { messageHandler, telegramBot } = setup();

		await messageHandler?.({ chat: { id: 123 }, text: "/setProfile" });
		await messageHandler?.({ chat: { id: 123 }, text: "/help" });

		expect(telegramBot.sendMessage).toHaveBeenLastCalledWith(
			123,
			SET_PROFILE_WIZARD_ACTIVE_COMMAND_BLOCK_MESSAGE,
		);
	});

	it("expires inactive /setProfile flow after timeout", async () => {
		const dateNowSpy = jest.spyOn(Date, "now");
		dateNowSpy.mockReturnValue(0);

		const { messageHandler, telegramBot, userProfileUpsert } = setup();

		await messageHandler?.({ chat: { id: 123 }, text: "/setProfile" });

		dateNowSpy.mockReturnValue(SET_PROFILE_WIZARD_TIMEOUT_MS + 1);
		await messageHandler?.({ chat: { id: 123 }, text: "backend engineer" });

		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			SET_PROFILE_WIZARD_EXPIRED_MESSAGE,
		);
		expect(userProfileUpsert.run).not.toHaveBeenCalled();

		dateNowSpy.mockRestore();
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
			chatId: "123",
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

	it("responds with private/self-hosted message for unauthorized chat commands", async () => {
		const { messageHandler, telegramBot, jobSearchPremiseAnalyze } = setup({
			allowedChatIds: ["123"],
		});

		await expect(
			messageHandler?.({
				chat: { id: 999 },
				text: "/createSearch senior backend engineer weekly 09:30 4.5",
			}),
		).resolves.toBeUndefined();

		expect(telegramBot.sendMessage).toHaveBeenCalledTimes(1);
		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			999,
			"This bot is private and self-hosted. To use it, deploy your own instance and check the project's GitHub repository.",
		);
		expect(jobSearchPremiseAnalyze.run).not.toHaveBeenCalled();
	});
});
