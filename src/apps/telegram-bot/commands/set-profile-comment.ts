import type TelegramBot from "node-telegram-bot-api";
import type { Logger } from "../../../context/Shared/domain/Logger";
import type { UserProfileFinder } from "../../../context/UserProfile/application/UserProfileFinder";
import type { UserProfileUpsert } from "../../../context/UserProfile/application/UserProfileUpsert";
import {
	TelegramCommandWithArgs,
	type TypedTelegramCommandRunContext,
} from "./command";

const SET_PROFILE_COMMENT_COMMAND = /^\/setProfileComment(?:@\w+)?\b/i;
const SET_PROFILE_COMMENT_TEMPLATE = "/setProfileComment {comment}";

function parseProfileComment(input: string): string | undefined {
	if (!input || input.toLowerCase() === "none") {
		return undefined;
	}

	return input.trim();
}

export class SetProfileCommentCommand extends TelegramCommandWithArgs<{
	comment: string;
}> {
	constructor(
		private readonly dependencies: {
			telegramBot: TelegramBot;
			logger: Logger;
			userProfileFinder: UserProfileFinder;
			userProfileUpsert: UserProfileUpsert;
		},
	) {
		super(
			SET_PROFILE_COMMENT_COMMAND,
			dependencies.telegramBot,
			dependencies.logger,
		);
	}

	protected commandTemplate(): string {
		return SET_PROFILE_COMMENT_TEMPLATE;
	}

	protected async run({
		chatId,
		args,
	}: TypedTelegramCommandRunContext<{ comment: string }>): Promise<void> {
		const profile = await this.dependencies.userProfileFinder.run({
			chatId: String(chatId),
		});
		if (!profile) {
			await this.dependencies.telegramBot.sendMessage(
				chatId,
				"No candidate profile found. Use /setProfile first.",
			);
			return;
		}

		await this.dependencies.userProfileUpsert.run({
			chatId: String(chatId),
			...profile.toPrimitives(),
			profileComment: parseProfileComment(args.comment),
		});

		await this.dependencies.telegramBot.sendMessage(
			chatId,
			"Candidate profile comment saved successfully.",
		);
	}

	protected genericErrorMessage(): string {
		return "Unable to save profile comment. Please check the command format.";
	}
}
