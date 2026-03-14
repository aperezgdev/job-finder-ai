import type { UserProfile } from "./UserProfile";

export interface UserProfileRepository {
	save(chatId: string, userProfile: UserProfile): Promise<void>;
	findByChatId(chatId: string): Promise<UserProfile | null>;
	deleteByChatId(chatId: string): Promise<boolean>;
}
