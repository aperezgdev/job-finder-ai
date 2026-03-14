import { UserProfileComment } from "./UserProfileComment";
import { UserProfileCurrentRole } from "./UserProfileCurrentRole";
import { UserProfileMinSalary } from "./UserProfileMinSalary";
import { UserProfilePriorities } from "./UserProfilePriorities";
import { UserProfileSectorExperience } from "./UserProfileSectorExperience";
import { UserProfileSkills } from "./UserProfileSkills";
import { UserProfileTargetLocations } from "./UserProfileTargetLocations";
import { UserProfileTargetRoles } from "./UserProfileTargetRoles";
import { UserProfileTargetSeniorities } from "./UserProfileTargetSeniorities";
import { UserProfileTargetWorkModes } from "./UserProfileTargetWorkModes";
import { UserProfileYearsExperience } from "./UserProfileYearsExperience";

export type UserProfilePrimitives = {
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
};

export class UserProfile {
	private constructor(
		private readonly currentRole: UserProfileCurrentRole,
		private readonly yearsExperience: UserProfileYearsExperience,
		private readonly priorities: UserProfilePriorities,
		private readonly sectorExperience: UserProfileSectorExperience,
		private readonly targetRoles: UserProfileTargetRoles,
		private readonly targetWorkModes: UserProfileTargetWorkModes,
		private readonly targetSeniorities: UserProfileTargetSeniorities,
		private readonly targetLocations: UserProfileTargetLocations,
		private readonly skills: UserProfileSkills,
		private readonly minSalary?: UserProfileMinSalary,
		private readonly profileComment?: UserProfileComment,
	) {}

	static create(primitives: UserProfilePrimitives): UserProfile {
		return new UserProfile(
			new UserProfileCurrentRole(primitives.currentRole),
			new UserProfileYearsExperience(primitives.yearsExperience),
			new UserProfilePriorities(primitives.priorities),
			new UserProfileSectorExperience(primitives.sectorExperience),
			new UserProfileTargetRoles(primitives.targetRoles),
			new UserProfileTargetWorkModes(primitives.targetWorkModes),
			new UserProfileTargetSeniorities(primitives.targetSeniorities),
			new UserProfileTargetLocations(primitives.targetLocations),
			new UserProfileSkills(primitives.skills),
			primitives.minSalary !== undefined
				? new UserProfileMinSalary(primitives.minSalary)
				: undefined,
			primitives.profileComment !== undefined
				? new UserProfileComment(primitives.profileComment)
				: undefined,
		);
	}

	static fromPrimitives(primitives: UserProfilePrimitives): UserProfile {
		return UserProfile.create(primitives);
	}

	toPrimitives(): UserProfilePrimitives {
		return {
			currentRole: this.currentRole.value,
			yearsExperience: this.yearsExperience.value,
			priorities: [...this.priorities.value],
			sectorExperience: [...this.sectorExperience.value],
			targetRoles: [...this.targetRoles.value],
			targetWorkModes: [...this.targetWorkModes.value],
			targetSeniorities: [...this.targetSeniorities.value],
			targetLocations: [...this.targetLocations.value],
			skills: [...this.skills.value],
			minSalary: this.minSalary?.value,
			profileComment: this.profileComment?.value,
		};
	}
}
