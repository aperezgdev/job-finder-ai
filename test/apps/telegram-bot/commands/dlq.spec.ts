import { DlqCommand } from "../../../../src/apps/telegram-bot/commands/dlq";

describe("DlqCommand", () => {
	it("sends dead-letter jobs details when queue has entries", async () => {
		const telegramBot = {
			sendMessage: jest.fn().mockResolvedValue(undefined),
		};
		const deadLetterQueue = {
			getJobs: jest.fn().mockResolvedValue([
				{
					id: "dlq-1",
					data: {
						originalJobId: "job-123",
						originalPayload: { jobSearchId: "search-1" },
						attemptsMade: 2,
						maxAttempts: 3,
						failedAt: "2026-02-25T12:00:00.000Z",
						error: "timeout error",
					},
				},
			]),
		};
		const command = new DlqCommand({
			telegramBot: telegramBot as never,
			deadLetterQueue: deadLetterQueue as never,
		});

		await expect(
			command.execute({ chatId: 123, text: "/dlq 5" }),
		).resolves.toBeUndefined();

		expect(telegramBot.sendMessage).toHaveBeenCalledTimes(1);
		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			[
				"Dead-letter jobs (showing 1):",
				"1. dlq-1",
				"   - Original job: job-123",
				"   - Search id: search-1",
				"   - Attempts: 2/3",
				"   - Failed at: 2026-02-25T12:00:00.000Z",
				"   - Error: timeout error",
			].join("\n"),
		);
	});

	it("uses provided limit to fetch dead-letter jobs", async () => {
		const telegramBot = {
			sendMessage: jest.fn().mockResolvedValue(undefined),
		};
		const deadLetterQueue = {
			getJobs: jest.fn().mockResolvedValue([]),
		};
		const command = new DlqCommand({
			telegramBot: telegramBot as never,
			deadLetterQueue: deadLetterQueue as never,
		});

		await command.execute({ chatId: 123, text: "/dlq 5" });

		expect(deadLetterQueue.getJobs).toHaveBeenCalledWith(
			["waiting", "delayed", "active", "failed"],
			0,
			4,
			false,
		);
		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			"Dead-letter queue is empty.",
		);
	});

	it("sends generic error message when queue fails", async () => {
		const telegramBot = {
			sendMessage: jest.fn().mockResolvedValue(undefined),
		};
		const deadLetterQueue = {
			getJobs: jest.fn().mockRejectedValue(new Error("boom")),
		};
		const command = new DlqCommand({
			telegramBot: telegramBot as never,
			deadLetterQueue: deadLetterQueue as never,
		});

		await command.execute({ chatId: 123, text: "/dlq 5" });

		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			"Unable to list dead-letter jobs right now. Please try again later.",
		);
	});
});
