import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "job_searches" })
export class JobSearchEntity {
	@PrimaryColumn("text")
	id!: string;

	@Column("text")
	chatId!: string;

	@Column("text")
	premise!: string;

	@Column("text")
	filter!: string;

	@Column("text")
	periodicity!: string;

	@Column("text", { default: "09:00" })
	scheduledAtUtcHour!: string;

	@Column("real", { default: 4 })
	minNotificationRating!: number;

	constructor(
		id: string,
		chatId: string,
		premise: string,
		filter: string,
		periodicity: string,
		scheduledAtUtcHour: string,
		minNotificationRating: number,
	) {
		this.id = id;
		this.chatId = chatId;
		this.premise = premise;
		this.filter = filter;
		this.periodicity = periodicity;
		this.scheduledAtUtcHour = scheduledAtUtcHour;
		this.minNotificationRating = minNotificationRating;
	}
}
