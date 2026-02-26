import { SearchesCommand } from "../../../../src/apps/telegram-bot/commands/searches";

describe("SearchesCommand", () => {
	it("sends empty message when no searches", async () => {
		const telegramBot = {
			sendMessage: jest.fn().mockResolvedValue(undefined),
		};
		const jobSearchFinderAll = {
			run: jest.fn().mockResolvedValue([]),
		};
		const command = new SearchesCommand({
			telegramBot: telegramBot as never,
			jobSearchFinderAll: jobSearchFinderAll as never,
		});

		await command.execute({ chatId: 123, text: "/searches" });

		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			"No scheduled job searches found.",
		);
	});

	it("formats and sends scheduled searches", async () => {
		const telegramBot = {
			sendMessage: jest.fn().mockResolvedValue(undefined),
		};
		const jobSearchFinderAll = {
			run: jest.fn().mockResolvedValue([
				{
					toPrimitives: () => ({
						id: "id-1",
						premise: "backend",
						periodicity: "weekly",
						scheduledAtUtcHour: "09:30",
						minNotificationRating: 4,
					}),
				},
			]),
		};
		const command = new SearchesCommand({
			telegramBot: telegramBot as never,
			jobSearchFinderAll: jobSearchFinderAll as never,
		});

		await command.execute({ chatId: 123, text: "/searches" });

		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			[
				"Scheduled job searches:",
				"1. backend",
				"   - Id: id-1",
				"   - Periodicity: weekly",
				"   - Scheduled at (UTC): 09:30",
				"   - Min rating to notify: 4",
			].join("\n"),
		);
	});
});
