import type { Logger } from "../../Shared/domain/Logger";
import { UserProfile } from "../domain/UserProfile";
import type { UserProfileRepository } from "../domain/UserProfileRepository";

export class UserProfileUpsert {
	constructor(
		private readonly userProfileRepository: UserProfileRepository,
		private readonly logger: Logger,
	) {}

	async run({
		chatId,
		...input
	}: {
		chatId: string;
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
	}): Promise<void> {
		const profile = UserProfile.create(input);
		await this.userProfileRepository.save(chatId, profile);
		this.logger.info("UserProfileUpsert - run - Profile saved");
	}
}
