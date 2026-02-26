import { CreateSearchCommand } from "../../../../src/apps/telegram-bot/commands/create-search";

describe("CreateSearchCommand", () => {
	it("parses command arguments and delegates to use case", async () => {
		const telegramBot = {
			sendMessage: jest.fn().mockResolvedValue(undefined),
		};
		const jobSearchPremiseAnalyze = {
			run: jest.fn().mockResolvedValue(undefined),
		};
		const command = new CreateSearchCommand({
			telegramBot: telegramBot as never,
			jobSearchPremiseAnalyze: jobSearchPremiseAnalyze as never,
		});

		await command.execute({
			chatId: 123,
			text: "/createSearch senior backend engineer weekly 09:30 4.5",
		});

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

	it("sends generic error message when use case fails", async () => {
		const telegramBot = {
			sendMessage: jest.fn().mockResolvedValue(undefined),
		};
		const jobSearchPremiseAnalyze = {
			run: jest.fn().mockRejectedValue(new Error("boom")),
		};
		const command = new CreateSearchCommand({
			telegramBot: telegramBot as never,
			jobSearchPremiseAnalyze: jobSearchPremiseAnalyze as never,
		});

		await command.execute({
			chatId: 123,
			text: "/createSearch senior backend engineer weekly 09:30 4.5",
		});

		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			"Unable to create job search. Please check the command format.",
		);
	});
});
