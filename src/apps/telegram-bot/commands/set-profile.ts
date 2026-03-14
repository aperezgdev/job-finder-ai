import type TelegramBot from "node-telegram-bot-api";
import type { UserProfileUpsert } from "../../../context/UserProfile/application/UserProfileUpsert";
import {
	splitCsv,
	TelegramCommandWithArgs,
	type TypedTelegramCommandRunContext,
} from "./command";

const SET_PROFILE_COMMAND = /^\/setProfile(?:@\w+)?\b/i;
const SET_PROFILE_TEMPLATE =
	"/setProfile {currentRole} {yearsExperience} {prioritiesCsv} {sectorExperienceCsv} {targetRolesCsv} {targetWorkModesCsv} {targetSenioritiesCsv} {targetLocationsCsv} {skillsCsv} {minSalaryOrNone}";

function parseMinSalary(input: string): number | undefined {
	if (!input || input.toLowerCase() === "none") {
		return undefined;
	}

	return Number(input);
}

export class SetProfileCommand extends TelegramCommandWithArgs<{
	currentRole: string;
	yearsExperience: string;
	prioritiesCsv: string;
	sectorExperienceCsv: string;
	targetRolesCsv: string;
	targetWorkModesCsv: string;
	targetSenioritiesCsv: string;
	targetLocationsCsv: string;
	skillsCsv: string;
	minSalaryOrNone: string;
}> {
	constructor(
		private readonly dependencies: {
			telegramBot: TelegramBot;
			userProfileUpsert: UserProfileUpsert;
		},
	) {
		super(SET_PROFILE_COMMAND, dependencies.telegramBot);
	}

	protected commandTemplate(): string {
		return SET_PROFILE_TEMPLATE;
	}

	protected async run({
		chatId,
		args,
	}: TypedTelegramCommandRunContext<{
		currentRole: string;
		yearsExperience: string;
		prioritiesCsv: string;
		sectorExperienceCsv: string;
		targetRolesCsv: string;
		targetWorkModesCsv: string;
		targetSenioritiesCsv: string;
		targetLocationsCsv: string;
		skillsCsv: string;
		minSalaryOrNone: string;
	}>): Promise<void> {
		await this.dependencies.userProfileUpsert.run({
			chatId: String(chatId),
			currentRole: args.currentRole,
			yearsExperience: Number(args.yearsExperience),
			priorities: splitCsv(args.prioritiesCsv),
			sectorExperience: splitCsv(args.sectorExperienceCsv),
			targetRoles: splitCsv(args.targetRolesCsv),
			targetWorkModes: splitCsv(args.targetWorkModesCsv),
			targetSeniorities: splitCsv(args.targetSenioritiesCsv),
			targetLocations: splitCsv(args.targetLocationsCsv),
			skills: splitCsv(args.skillsCsv),
			minSalary: parseMinSalary(args.minSalaryOrNone),
		});

		await this.dependencies.telegramBot.sendMessage(
			chatId,
			"Candidate profile saved successfully.",
		);
	}

	protected genericErrorMessage(): string {
		return "Unable to save candidate profile. Please check the command format.";
	}
}
