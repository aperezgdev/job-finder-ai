import { HelpCommand } from "../../../../src/apps/telegram-bot/commands/help";

const EXPECTED_HELP_MESSAGE = [
	"Available commands:",
	"",
	"/help",
	"Show all available commands.",
	"",
	"/setProfile",
	"Create or update candidate profile with a guided question-by-question flow.",
	"",
	"/cancel",
	"Cancel an active /setProfile flow.",
	"",
	"/setProfileComment {comment}",
	"Set an additional profile comment used by AI scoring. Use 'none' to clear it.",
	"",
	"/profile",
	"Show your candidate profile.",
	"",
	"/deleteProfile",
	"Delete your candidate profile.",
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
