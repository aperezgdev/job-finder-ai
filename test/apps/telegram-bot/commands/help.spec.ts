import { HelpCommand } from "../../../../src/apps/telegram-bot/commands/help";

const EXPECTED_HELP_MESSAGE = [
	"Available commands:",
	"",
	"/help",
	"Show all available commands.",
	"",
	"/createSearch {premise} {periodicity} {scheduledAtUtcHour} {minimumRatingToNotify}",
	"Create a job search.",
	"Valid periodicity: daily, weekly, biweekly, monthly.",
	"Valid scheduled UTC hour: HH:mm (24h), for example 09:30.",
	"Valid minimum rating: from 3 to 5 in 0.5 steps.",
	"",
	"/searches",
	"List all scheduled job searches.",
	"",
	"/scored",
	"List all scored jobs.",
	"",
	"/scoredSearch {jobSearchId}",
	"List scored jobs for one specific search.",
	"",
	"/deleteSearch {jobSearchId}",
	"Delete one job search and unschedule its job.",
	"",
	"/deleteSearchAll",
	"Delete all job searches and unschedule all jobs.",
	"",
	"/dlq [limit]",
	"List dead-letter jobs (default 10, max 30).",
].join("\n");

describe("HelpCommand", () => {
	it("sends help message", async () => {
		const telegramBot = {
			sendMessage: jest.fn().mockResolvedValue(undefined),
		};
		const command = new HelpCommand(telegramBot as never);

		await command.execute({ chatId: 123, text: "/help" });

		expect(telegramBot.sendMessage).toHaveBeenCalledTimes(1);
		expect(telegramBot.sendMessage).toHaveBeenCalledWith(
			123,
			EXPECTED_HELP_MESSAGE,
		);
	});
});
