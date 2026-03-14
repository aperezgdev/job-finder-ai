import type { Logger } from "../../Shared/domain/Logger";
import type { UserProfile } from "../domain/UserProfile";
import type { UserProfileRepository } from "../domain/UserProfileRepository";

export class UserProfileFinder {
	constructor(
		private readonly userProfileRepository: UserProfileRepository,
		private readonly logger: Logger,
	) {}

	async run({ chatId }: { chatId: string }): Promise<UserProfile | null> {
		const userProfile = await this.userProfileRepository.findByChatId(chatId);
		this.logger.info("UserProfileFinder - run - Profile fetched", {
			chatId,
			found: Boolean(userProfile),
		});

		return userProfile;
	}
}
