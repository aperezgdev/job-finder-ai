import type TelegramBot from "node-telegram-bot-api";
import type { Logger } from "../../../context/Shared/domain/Logger";
import type { UserProfileDelete } from "../../../context/UserProfile/application/UserProfileDelete";
import { TelegramCommand, type TelegramCommandRunContext } from "./command";

const DELETE_PROFILE_COMMAND = /^\/deleteProfile(?:@\w+)?\b/i;

export class DeleteProfileCommand extends TelegramCommand {
	constructor(
		private readonly dependencies: {
			telegramBot: TelegramBot;
			logger: Logger;
			userProfileDelete: UserProfileDelete;
		},
	) {
		super(
			DELETE_PROFILE_COMMAND,
			dependencies.telegramBot,
			dependencies.logger,
		);
	}

	protected async run({ chatId }: TelegramCommandRunContext): Promise<void> {
		await this.dependencies.userProfileDelete.run({
			chatId: String(chatId),
		});
		await this.dependencies.telegramBot.sendMessage(
			chatId,
			"Candidate profile deleted.",
		);
	}
}
