import type { Logger } from "../../Shared/domain/Logger";
import type { UserProfileRepository } from "../domain/UserProfileRepository";

export class UserProfileDelete {
	constructor(
		private readonly userProfileRepository: UserProfileRepository,
		private readonly logger: Logger,
	) {}

	async run({ chatId }: { chatId: string }): Promise<void> {
		const profileDeleted =
			await this.userProfileRepository.deleteByChatId(chatId);

		if (profileDeleted) {
			this.logger.info("UserProfileDelete - run - Profile deleted", {
				chatId,
			});
			return;
		}

		this.logger.warn("UserProfileDelete - run - Profile not found", {
			chatId,
		});
	}
}
