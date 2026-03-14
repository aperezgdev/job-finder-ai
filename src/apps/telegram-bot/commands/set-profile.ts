import type TelegramBot from "node-telegram-bot-api";
import { ValidationError } from "../../../context/Shared/domain/ValidationError";
import type { UserProfileUpsert } from "../../../context/UserProfile/application/UserProfileUpsert";
import {
	splitCsv,
	TelegramWizardCommand,
	type TelegramWizardConfig,
	type TelegramWizardStep,
} from "./command";

export const SET_PROFILE_COMMAND = /^\/setProfile(?:@\w+)?(?:\s+.*)?$/i;
export const CANCEL_COMMAND = /^\/cancel(?:@\w+)?\b/i;
export const SET_PROFILE_WIZARD_TIMEOUT_MS = 5 * 60 * 1000;
export const SET_PROFILE_WIZARD_EXPIRED_MESSAGE =
	"Your /setProfile flow expired after 5 minutes of inactivity. Start again with /setProfile.";
export const SET_PROFILE_WIZARD_ACTIVE_COMMAND_BLOCK_MESSAGE =
	"You have an active /setProfile flow. Reply to the current question or use /cancel.";
export const SET_PROFILE_WIZARD_CANCELLED_MESSAGE =
	"/setProfile flow canceled.";
export const SET_PROFILE_WIZARD_NO_ACTIVE_CANCEL_MESSAGE =
	"No active /setProfile flow to cancel.";

const NON_EMPTY_RESPONSE_MESSAGE = "Please send a non-empty response.";

export type SetProfileWizardState = {
	currentRole?: string;
	yearsExperience?: number;
	priorities?: string[];
	sectorExperience?: string[];
	targetRoles?: string[];
	targetWorkModes?: string[];
	targetSeniorities?: string[];
	targetLocations?: string[];
	skills?: string[];
	minSalary?: number;
};

export type SetProfileWizardCompletedPayload = {
	currentRole: string;
	yearsExperience: number;
	priorities: string[];
	sectorExperience: string[];
	targetRoles: string[];
	targetWorkModes: string[];
	targetSeniorities: string[];
	targetLocations: string[];
	skills: string[];
	minSalary?: number;
};

function parseMinSalary(input: string): number | undefined {
	if (!input || input.toLowerCase() === "none") {
		return undefined;
	}

	const value = Number(input);
	if (!Number.isFinite(value) || value < 0) {
		throw new Error("minSalary must be greater or equal to 0");
	}

	return value;
}

function parseYearsExperience(input: string): number {
	const value = Number(input);
	if (!Number.isFinite(value) || value < 0) {
		throw new Error("yearsExperience must be greater or equal to 0");
	}

	return value;
}

function buildCompletedPayload(
	state: SetProfileWizardState,
): SetProfileWizardCompletedPayload {
	return {
		currentRole: state.currentRole ?? "",
		yearsExperience: state.yearsExperience ?? 0,
		priorities: state.priorities ?? [],
		sectorExperience: state.sectorExperience ?? [],
		targetRoles: state.targetRoles ?? [],
		targetWorkModes: state.targetWorkModes ?? [],
		targetSeniorities: state.targetSeniorities ?? [],
		targetLocations: state.targetLocations ?? [],
		skills: state.skills ?? [],
		minSalary: state.minSalary,
	};
}

function getSetProfileCommandPayload(text: string): string {
	return text.replace(/^\/setProfile(?:@\w+)?/i, "").trim();
}

const SET_PROFILE_STEPS: ReadonlyArray<
	TelegramWizardStep<SetProfileWizardState>
> = [
	{
		key: "currentRole",
		prompt: "Step 1/10 - What's your current role?",
		validate: (input) => {
			const currentRole = input.trim();
			if (currentRole.length === 0) {
				return NON_EMPTY_RESPONSE_MESSAGE;
			}

			return undefined;
		},
		parse: (input) => input.trim(),
	},
	{
		key: "yearsExperience",
		prompt:
			"Step 2/10 - How many years of experience do you have? (number >= 0)",
		validate: (input) => {
			try {
				parseYearsExperience(input.trim());
				return undefined;
			} catch (error) {
				return error instanceof Error
					? error.message
					: "Unable to process this answer.";
			}
		},
		parse: (input) => parseYearsExperience(input.trim()),
	},
	{
		key: "priorities",
		prompt: "Step 3/10 - What are your priorities? (comma-separated or 'none')",
		parse: (input) => splitCsv(input.trim()),
	},
	{
		key: "sectorExperience",
		prompt:
			"Step 4/10 - Which sectors do you have experience in? (comma-separated or 'none')",
		parse: (input) => splitCsv(input.trim()),
	},
	{
		key: "targetRoles",
		prompt:
			"Step 5/10 - Which target roles are you looking for? (comma-separated or 'none')",
		parse: (input) => splitCsv(input.trim()),
	},
	{
		key: "targetWorkModes",
		prompt:
			"Step 6/10 - Which work modes do you prefer? (comma-separated or 'none')",
		parse: (input) => splitCsv(input.trim()),
	},
	{
		key: "targetSeniorities",
		prompt:
			"Step 7/10 - Which seniorities do you target? (comma-separated or 'none')",
		parse: (input) => splitCsv(input.trim()),
	},
	{
		key: "targetLocations",
		prompt:
			"Step 8/10 - Which locations do you target? (comma-separated or 'none')",
		parse: (input) => splitCsv(input.trim()),
	},
	{
		key: "skills",
		prompt:
			"Step 9/10 - Which skills should we prioritize? (comma-separated or 'none')",
		parse: (input) => splitCsv(input.trim()),
	},
	{
		key: "minSalary",
		prompt: "Step 10/10 - What's your minimum salary? (number >= 0 or 'none')",
		validate: (input) => {
			try {
				parseMinSalary(input.trim());
				return undefined;
			} catch (error) {
				return error instanceof Error
					? error.message
					: "Unable to process this answer.";
			}
		},
		parse: (input) => parseMinSalary(input.trim()),
	},
];

const SET_PROFILE_WIZARD_CONFIG: TelegramWizardConfig<SetProfileWizardState> = {
	startCommand: SET_PROFILE_COMMAND,
	steps: SET_PROFILE_STEPS,
	cancelCommand: CANCEL_COMMAND,
	timeoutMs: SET_PROFILE_WIZARD_TIMEOUT_MS,
	createInitialState: () => ({}),
	startMessage: ({ text, firstStepPrompt }) => {
		const payload = getSetProfileCommandPayload(text);
		const guidance =
			payload.length > 0
				? "The /setProfile command is now interactive. I'll ask one question at a time."
				: "Let's set up your profile.";

		return `${guidance}\n\n${firstStepPrompt}\n\nUse /cancel to abort.`;
	},
	cancelledMessage: SET_PROFILE_WIZARD_CANCELLED_MESSAGE,
	noActiveCancelMessage: SET_PROFILE_WIZARD_NO_ACTIVE_CANCEL_MESSAGE,
	expiredMessage: SET_PROFILE_WIZARD_EXPIRED_MESSAGE,
	activeCommandBlockMessage: SET_PROFILE_WIZARD_ACTIVE_COMMAND_BLOCK_MESSAGE,
	invalidStateMessage:
		"Invalid /setProfile flow state. Please start again with /setProfile.",
};

export class SetProfileWizardCommand extends TelegramWizardCommand<SetProfileWizardState> {
	constructor(
		private readonly dependencies: {
			telegramBot: TelegramBot;
			userProfileUpsert: UserProfileUpsert;
		},
	) {
		super(dependencies.telegramBot, SET_PROFILE_WIZARD_CONFIG);
	}

	protected async onCompleted({
		chatId,
		state,
	}: {
		chatId: number;
		state: SetProfileWizardState;
	}): Promise<void> {
		const payload = buildCompletedPayload(state);

		try {
			await this.dependencies.userProfileUpsert.run({
				chatId: String(chatId),
				...payload,
			});
			await this.sendMessage(chatId, "Candidate profile saved successfully.");
		} catch (error) {
			const message =
				error instanceof ValidationError
					? error.message
					: "Unable to save candidate profile. Please start again with /setProfile.";
			await this.sendMessage(chatId, message);
		}
	}
}
