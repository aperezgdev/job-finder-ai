import {
	ScoredCommand,
	ScoredSearchCommand,
} from "../../../../src/apps/telegram-bot/commands/scored";

describe("ScoredCommand", () => {
	it("sends scored jobs message when finder returns data", async () => {
		const telegramBot = {
			sendMessage: jest.fn().mockResolvedValue(undefined),
		};
		const jobScoredFinderAll = {
			run: jest.fn().mockResolvedValue([
				{
					rating: 4.5,
					title: "Backend Engineer",
					company: "Acme",
					jobOfferId: "offer-1",
					link: "https://example.com/jobs/1",
				},
			]),
		};
		const command = new ScoredCommand({
			telegramBot: telegramBot as never,
			jobScoredFinderAll: jobScoredFinderAll as never,
		});

		await expect(
			command.execute({ chatId: 123, text: "/scored" }),
		).resolves.toBeUndefined();

		expect(jobScoredFinderAll.run).toHaveBeenCalledWith({
			chatId: "123",
		});

		expect(telegramBot.sendMessage).toHaveBeenCalledTimes(1);
		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			[
				"Scored jobs:",
				"1. [4.5] Backend Engineer (Acme)",
				"   - Job offer id: offer-1",
				"   - Link: https://example.com/jobs/1",
			].join("\n"),
		);
	});

	it("sends empty message when no scored jobs", async () => {
		const telegramBot = {
			sendMessage: jest.fn().mockResolvedValue(undefined),
		};
		const jobScoredFinderAll = {
			run: jest.fn().mockResolvedValue([]),
		};
		const command = new ScoredCommand({
			telegramBot: telegramBot as never,
			jobScoredFinderAll: jobScoredFinderAll as never,
		});

		await command.execute({ chatId: 123, text: "/scored" });

		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			"No scored jobs found.",
		);
	});

	it("sends generic error when finder fails", async () => {
		const telegramBot = {
			sendMessage: jest.fn().mockResolvedValue(undefined),
		};
		const jobScoredFinderAll = {
			run: jest.fn().mockRejectedValue(new Error("boom")),
		};
		const command = new ScoredCommand({
			telegramBot: telegramBot as never,
			jobScoredFinderAll: jobScoredFinderAll as never,
		});

		await command.execute({ chatId: 123, text: "/scored" });

		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			"Unable to list scored jobs right now. Please try again later.",
		);
	});
});

describe("ScoredSearchCommand", () => {
	it("sends scored jobs for specific search when data exists", async () => {
		const telegramBot = {
			sendMessage: jest.fn().mockResolvedValue(undefined),
		};
		const jobScoredFinderBySearch = {
			run: jest.fn().mockResolvedValue([
				{
					rating: 5,
					title: "Senior Backend",
					company: "Globex",
					jobOfferId: "offer-2",
					link: "https://example.com/jobs/2",
				},
			]),
		};
		const command = new ScoredSearchCommand({
			telegramBot: telegramBot as never,
			jobScoredFinderBySearch: jobScoredFinderBySearch as never,
		});

		await expect(
			command.execute({ chatId: 123, text: "/scoredSearch search-1" }),
		).resolves.toBeUndefined();

		expect(jobScoredFinderBySearch.run).toHaveBeenCalledWith({
			jobSearchId: "search-1",
			chatId: "123",
		});
		expect(telegramBot.sendMessage).toHaveBeenCalledTimes(1);
		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			[
				"Scored jobs for search search-1:",
				"1. [5] Senior Backend (Globex)",
				"   - Job offer id: offer-2",
				"   - Link: https://example.com/jobs/2",
			].join("\n"),
		);
	});

	it("extracts jobSearchId and queries scored jobs by search", async () => {
		const telegramBot = {
			sendMessage: jest.fn().mockResolvedValue(undefined),
		};
		const jobScoredFinderBySearch = {
			run: jest.fn().mockResolvedValue([]),
		};
		const command = new ScoredSearchCommand({
			telegramBot: telegramBot as never,
			jobScoredFinderBySearch: jobScoredFinderBySearch as never,
		});

		await command.execute({ chatId: 123, text: "/scoredSearch search-1" });

		expect(jobScoredFinderBySearch.run).toHaveBeenCalledWith({
			jobSearchId: "search-1",
			chatId: "123",
		});
		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			"No scored jobs found for search search-1.",
		);
	});
});
