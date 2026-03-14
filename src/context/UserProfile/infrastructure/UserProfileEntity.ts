import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "user_profiles" })
export class UserProfileEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column("text")
	chatId!: string;

	@Column("text")
	currentRole!: string;

	@Column("real")
	yearsExperience!: number;

	@Column("simple-json")
	priorities!: string[];

	@Column("simple-json")
	sectorExperience!: string[];

	@Column("simple-json")
	targetRoles!: string[];

	@Column("simple-json")
	targetWorkModes!: string[];

	@Column("simple-json")
	targetSeniorities!: string[];

	@Column("simple-json")
	targetLocations!: string[];

	@Column("simple-json")
	skills!: string[];

	@Column("real", { nullable: true })
	minSalary?: number;

	@Column("text", { nullable: true })
	profileComment?: string;

	constructor(
		chatId: string,
		currentRole: string,
		yearsExperience: number,
		priorities: string[],
		sectorExperience: string[],
		targetRoles: string[],
		targetWorkModes: string[],
		targetSeniorities: string[],
		targetLocations: string[],
		skills: string[],
		minSalary?: number,
		profileComment?: string,
	) {
		this.chatId = chatId;
		this.currentRole = currentRole;
		this.yearsExperience = yearsExperience;
		this.priorities = priorities;
		this.sectorExperience = sectorExperience;
		this.targetRoles = targetRoles;
		this.targetWorkModes = targetWorkModes;
		this.targetSeniorities = targetSeniorities;
		this.targetLocations = targetLocations;
		this.skills = skills;
		this.minSalary = minSalary;
		this.profileComment = profileComment;
	}
}
