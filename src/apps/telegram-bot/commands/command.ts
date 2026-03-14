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

export type TelegramWizardStep<
	TState extends Record<string, unknown>,
	TKey extends keyof TState = keyof TState,
> = {
	key: TKey;
	prompt: string | ((state: TState) => string);
	parse?: (input: string, state: TState) => TState[TKey];
	validate?: (input: string, state: TState) => string | undefined;
};

export type TelegramWizardConfig<TState extends Record<string, unknown>> = {
	startCommand: RegExp;
	steps: ReadonlyArray<TelegramWizardStep<TState>>;
	cancelCommand?: RegExp;
	timeoutMs?: number;
	createInitialState?: () => TState;
	startMessage?: (input: { text: string; firstStepPrompt: string }) => string;
	cancelledMessage?: string;
	noActiveCancelMessage?: string;
	expiredMessage?: string;
	activeCommandBlockMessage?: string;
	invalidStateMessage?: string;
};

type TelegramWizardSession<TState> = {
	stepIndex: number;
	updatedAt: number;
	state: TState;
};

export function splitCsv(input: string): string[] {
	if (!input || input.toLowerCase() === "none") {
		return [];
	}

	return input
		.split(",")
		.map((value) => value.trim())
		.filter((value) => value.length > 0);
}

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

export abstract class TelegramWizardCommand<
	TState extends Record<string, unknown>,
> {
	private readonly sessions = new Map<string, TelegramWizardSession<TState>>();

	constructor(
		protected readonly telegramBot: TelegramBot,
		private readonly config: TelegramWizardConfig<TState>,
	) {}

	async handle({ chatId, text }: TelegramCommandRunContext): Promise<boolean> {
		const formattedText = text.trim();
		const sessionKey = String(chatId);
		const now = Date.now();

		if (this.config.steps.length === 0) {
			return false;
		}

		const activeSession = this.sessions.get(sessionKey);
		if (activeSession && now - activeSession.updatedAt > this.timeoutMs()) {
			this.sessions.delete(sessionKey);
			if (!this.config.startCommand.test(formattedText)) {
				await this.sendMessage(chatId, this.expiredMessage());
				return true;
			}
		}

		if (this.cancelCommand().test(formattedText)) {
			if (this.sessions.has(sessionKey)) {
				this.sessions.delete(sessionKey);
				await this.sendMessage(chatId, this.cancelledMessage());
				return true;
			}

			await this.sendMessage(chatId, this.noActiveCancelMessage());
			return true;
		}

		if (this.config.startCommand.test(formattedText)) {
			const state = this.createInitialState();
			const firstStepPrompt = this.resolvePrompt(this.config.steps[0], state);
			this.sessions.set(sessionKey, {
				stepIndex: 0,
				updatedAt: now,
				state,
			});
			await this.sendMessage(
				chatId,
				this.startMessage({ text: formattedText, firstStepPrompt }),
			);
			return true;
		}

		const session = this.sessions.get(sessionKey);
		if (!session) {
			return false;
		}

		if (formattedText.startsWith("/")) {
			await this.sendMessage(chatId, this.activeCommandBlockMessage());
			return true;
		}

		const currentStep = this.config.steps[session.stepIndex];
		if (!currentStep) {
			this.sessions.delete(sessionKey);
			await this.sendMessage(chatId, this.invalidStateMessage());
			return true;
		}

		const validationError = currentStep.validate?.(
			formattedText,
			session.state,
		);
		if (validationError) {
			this.sessions.set(sessionKey, {
				...session,
				updatedAt: now,
				state: session.state,
			});
			await this.sendMessage(
				chatId,
				`${validationError}\n\n${this.resolvePrompt(currentStep, session.state)}`,
			);
			return true;
		}

		const parsedValue = currentStep.parse
			? currentStep.parse(formattedText, session.state)
			: (formattedText.trim() as TState[keyof TState]);
		const nextState = {
			...session.state,
			[currentStep.key]: parsedValue,
		} as TState;

		const nextStepIndex = session.stepIndex + 1;
		const nextStep = this.config.steps[nextStepIndex];
		if (nextStep) {
			this.sessions.set(sessionKey, {
				stepIndex: nextStepIndex,
				updatedAt: now,
				state: nextState,
			});
			await this.sendMessage(chatId, this.resolvePrompt(nextStep, nextState));
			return true;
		}

		try {
			await this.onCompleted({ chatId, state: nextState });
		} finally {
			this.sessions.delete(sessionKey);
		}

		return true;
	}

	protected sendMessage(chatId: number, text: string): Promise<unknown> {
		return this.telegramBot.sendMessage(chatId, text);
	}

	private resolvePrompt(
		step: TelegramWizardStep<TState>,
		state: TState,
	): string {
		return typeof step.prompt === "function" ? step.prompt(state) : step.prompt;
	}

	private cancelCommand(): RegExp {
		return this.config.cancelCommand ?? /^\/cancel(?:@\w+)?\b/i;
	}

	private timeoutMs(): number {
		return this.config.timeoutMs ?? 5 * 60 * 1000;
	}

	private createInitialState(): TState {
		return this.config.createInitialState
			? this.config.createInitialState()
			: ({} as TState);
	}

	private startMessage({
		text,
		firstStepPrompt,
	}: {
		text: string;
		firstStepPrompt: string;
	}): string {
		if (this.config.startMessage) {
			return this.config.startMessage({ text, firstStepPrompt });
		}

		return `${firstStepPrompt}\n\nUse /cancel to abort.`;
	}

	private cancelledMessage(): string {
		return this.config.cancelledMessage ?? "Flow canceled.";
	}

	private noActiveCancelMessage(): string {
		return this.config.noActiveCancelMessage ?? "No active flow to cancel.";
	}

	private expiredMessage(): string {
		return this.config.expiredMessage ?? "Flow expired. Start again.";
	}

	private activeCommandBlockMessage(): string {
		return (
			this.config.activeCommandBlockMessage ??
			"You have an active flow. Reply to the current question or use /cancel."
		);
	}

	private invalidStateMessage(): string {
		return (
			this.config.invalidStateMessage ??
			"Invalid flow state. Please start again."
		);
	}

	protected abstract onCompleted({
		chatId,
		state,
	}: {
		chatId: number;
		state: TState;
	}): Promise<void>;
}
