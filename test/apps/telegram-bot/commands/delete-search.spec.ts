import {
	DeleteAllSearchesCommand,
	DeleteSearchCommand,
} from "../../../../src/apps/telegram-bot/commands/delete-search";

describe("DeleteSearchCommand", () => {
	it("extracts jobSearchId and deletes it", async () => {
		const telegramBot = {
			sendMessage: jest.fn().mockResolvedValue(undefined),
		};
		const jobSearchDelete = {
			run: jest.fn().mockResolvedValue(undefined),
		};
		const command = new DeleteSearchCommand({
			telegramBot: telegramBot as never,
			jobSearchDelete: jobSearchDelete as never,
		});

		await command.execute({
			chatId: 123,
			text: "/deleteSearch 0f8fad5b-d9cb-469f-a165-70867728950e",
		});

		expect(jobSearchDelete.run).toHaveBeenCalledWith({
			jobSearchId: "0f8fad5b-d9cb-469f-a165-70867728950e",
		});
		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			"Job search deleted successfully.",
		);
	});

	it("sends generic error message when delete fails", async () => {
		const telegramBot = {
			sendMessage: jest.fn().mockResolvedValue(undefined),
		};
		const jobSearchDelete = {
			run: jest.fn().mockRejectedValue(new Error("boom")),
		};
		const command = new DeleteSearchCommand({
			telegramBot: telegramBot as never,
			jobSearchDelete: jobSearchDelete as never,
		});

		await command.execute({
			chatId: 123,
			text: "/deleteSearch abc",
		});

		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			"Unable to delete job search. Please check the command format.",
		);
	});
});

describe("DeleteAllSearchesCommand", () => {
	it("deletes all and reports count", async () => {
		const telegramBot = {
			sendMessage: jest.fn().mockResolvedValue(undefined),
		};
		const jobSearchDeleteAll = {
			run: jest.fn().mockResolvedValue(3),
		};
		const command = new DeleteAllSearchesCommand({
			telegramBot: telegramBot as never,
			jobSearchDeleteAll: jobSearchDeleteAll as never,
		});

		await command.execute({ chatId: 123, text: "/deleteSearchAll" });

		expect(jobSearchDeleteAll.run).toHaveBeenCalledTimes(1);
		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			"Deleted 3 scheduled job search(es).",
		);
	});
});
