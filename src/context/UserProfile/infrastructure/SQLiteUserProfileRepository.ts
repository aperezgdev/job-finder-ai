import { SQLiteRepository } from "../../Shared/infrastructure/SQLiteRepository";
import { UserProfile } from "../domain/UserProfile";
import type { UserProfileRepository } from "../domain/UserProfileRepository";
import { UserProfileEntity } from "./UserProfileEntity";

export class SQLiteUserProfileRepository
	extends SQLiteRepository<UserProfileEntity>
	implements UserProfileRepository
{
	protected entityClass = UserProfileEntity;

	private toDomain(entity: UserProfileEntity): UserProfile {
		return UserProfile.fromPrimitives({
			currentRole: entity.currentRole,
			yearsExperience: entity.yearsExperience,
			priorities: entity.priorities,
			sectorExperience: entity.sectorExperience,
			targetRoles: entity.targetRoles,
			targetWorkModes: entity.targetWorkModes,
			targetSeniorities: entity.targetSeniorities,
			targetLocations: entity.targetLocations,
			skills: entity.skills,
			minSalary: entity.minSalary ?? undefined,
			profileComment: entity.profileComment ?? undefined,
		});
	}

	async save(chatId: string, userProfile: UserProfile): Promise<void> {
		const {
			currentRole,
			yearsExperience,
			priorities,
			sectorExperience,
			targetRoles,
			targetWorkModes,
			targetSeniorities,
			targetLocations,
			skills,
			minSalary,
			profileComment,
		} = userProfile.toPrimitives();
		const existing = await this.getCollection().findOneBy({ chatId });
		const entity = new UserProfileEntity(
			chatId,
			currentRole,
			yearsExperience,
			priorities,
			sectorExperience,
			targetRoles,
			targetWorkModes,
			targetSeniorities,
			targetLocations,
			skills,
			minSalary,
			profileComment,
		);

		if (existing) {
			entity.id = existing.id;
		}

		await this.merge(entity);
	}

	async findByChatId(chatId: string): Promise<UserProfile | null> {
		const entity = await this.getCollection().findOneBy({ chatId });
		if (!entity) {
			return null;
		}

		return this.toDomain(entity);
	}

	async deleteByChatId(chatId: string): Promise<boolean> {
		const deleteResult = await this.getCollection().delete({ chatId });
		if (!deleteResult.affected || deleteResult.affected === 0) {
			return false;
		}

		return true;
	}
}
