import type TelegramBot from "node-telegram-bot-api";
import type { UserProfileFinder } from "../../../context/UserProfile/application/UserProfileFinder";
import { TelegramCommand, type TelegramCommandRunContext } from "./command";

const PROFILE_COMMAND = /^\/profile(?:@\w+)?\b/i;

function formatProfile(profile: {
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
	profileComment?: string;
}): string {
	return [
		"Candidate profile:",
		`- Current role: ${profile.currentRole}`,
		`- Years experience: ${profile.yearsExperience}`,
		`- Priorities: ${profile.priorities.join(",") || "N/A"}`,
		`- Sector experience: ${profile.sectorExperience.join(",") || "N/A"}`,
		`- Target roles: ${profile.targetRoles.join(",") || "N/A"}`,
		`- Target work modes: ${profile.targetWorkModes.join(",") || "N/A"}`,
		`- Target seniorities: ${profile.targetSeniorities.join(",") || "N/A"}`,
		`- Target locations: ${profile.targetLocations.join(",") || "N/A"}`,
		`- Skills: ${profile.skills.join(",") || "N/A"}`,
		`- Min salary: ${profile.minSalary ?? "N/A"}`,
		`- Profile comment: ${profile.profileComment ?? "N/A"}`,
	].join("\n");
}

export class ProfileCommand extends TelegramCommand {
	constructor(
		private readonly dependencies: {
			telegramBot: TelegramBot;
			userProfileFinder: UserProfileFinder;
		},
	) {
		super(PROFILE_COMMAND, dependencies.telegramBot);
	}

	protected async run({ chatId }: TelegramCommandRunContext): Promise<void> {
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

		await this.dependencies.telegramBot.sendMessage(
			chatId,
			formatProfile(profile.toPrimitives()),
		);
	}
}
