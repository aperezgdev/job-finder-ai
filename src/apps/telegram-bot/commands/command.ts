import type TelegramBot from "node-telegram-bot-api";
import { ValidationError } from "../../../context/Shared/domain/ValidationError";

export type TelegramCommandExecution = {
	chatId: number;
	text: string;
};

export type TelegramCommandRunContext = {
	chatId: number;
	text: string;
};

type TelegramCommandErrorContext = {
	chatId: number;
	text: string;
	error: unknown;
};

export type TypedTelegramCommandRunContext<TArgs> = {
	chatId: number;
	text: string;
	args: TArgs;
};

export abstract class TelegramCommand {
	constructor(
		protected readonly commandPattern: RegExp,
		protected readonly telegramBot: TelegramBot,
	) {}

	matches(text: string): boolean {
		const formattedText = this.formatText(text);
		return this.commandPattern.test(formattedText);
	}

	async execute({ chatId, text }: TelegramCommandExecution): Promise<void> {
		const formattedText = this.formatText(text);

		try {
			await this.run({
				chatId,
				text: formattedText,
			});
		} catch (error) {
			await this.onExecutionError({
				chatId,
				text: formattedText,
				error,
			});
		}
	}

	protected formatText(text: string): string {
		return text.trim();
	}

	protected sendMessage(chatId: number, text: string): Promise<unknown> {
		return this.telegramBot.sendMessage(chatId, text);
	}

	protected genericErrorMessage(): string {
		return "Unable to process command right now. Please try again later.";
	}

	protected async onExecutionError({
		chatId,
		error,
	}: TelegramCommandErrorContext): Promise<void> {
		const message =
			error instanceof ValidationError
				? error.message
				: this.genericErrorMessage();

		await this.sendMessage(chatId, message);
	}

	protected abstract run(context: TelegramCommandRunContext): Promise<void>;
}

export abstract class TelegramCommandWithArgs<TArgs> extends TelegramCommand {
	protected abstract commandTemplate(): string;

	async execute({ chatId, text }: TelegramCommandExecution): Promise<void> {
		const formattedText = this.formatText(text);

		try {
			const args = this.parseArguments(formattedText);
			await this.run({
				chatId,
				text: formattedText,
				args,
			});
		} catch (error) {
			await this.onExecutionError({
				chatId,
				text: formattedText,
				error,
			});
		}
	}

	protected parseArguments(text: string): TArgs {
		const template = this.commandTemplate();
		const argumentKeys = Array.from(
			template.matchAll(/\{([a-zA-Z][\w]*)\}/g),
		).map((match) => match[1]);

		if (argumentKeys.length === 0) {
			return {} as TArgs;
		}

		const commandlessInput = text.replace(this.commandPattern, "").trim();
		const argumentTokens = commandlessInput.split(/\s+/).filter(Boolean);

		const normalizedTokens = [...argumentTokens];
		if (normalizedTokens.length > argumentKeys.length) {
			const overflow = normalizedTokens.length - argumentKeys.length;
			normalizedTokens.splice(
				0,
				overflow + 1,
				normalizedTokens.slice(0, overflow + 1).join(" "),
			);
		}

		const parsedArgs: Record<string, string> = {};
		for (const [index, key] of argumentKeys.entries()) {
			parsedArgs[key] = normalizedTokens[index] ?? "";
		}

		return parsedArgs as TArgs;
	}

	protected abstract run(
		context: TypedTelegramCommandRunContext<TArgs>,
	): Promise<void>;
}
