import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "job_offers" })
export class JobOfferEntity {
	@PrimaryColumn("text")
	id!: string;

	@Column("text")
	title!: string;

	@Column("text")
	company!: string;

	@Column("text")
	summary!: string;

	@Column("text")
	premise!: string;

	@Column("text")
	provider!: string;

	@Column("text")
	link!: string;

	@Column("real", { default: 4 })
	minNotificationRating!: number;

	@Column("text")
	workMode!: string;

	@Column("text", { nullable: true })
	location?: string;

	@Column("real", { nullable: true })
	salary?: number;

	constructor(
		id: string,
		title: string,
		company: string,
		summary: string,
		premise: string,
		provider: string,
		link: string,
		minNotificationRating: number,
		workMode: string,
		location?: string,
		salary?: number,
	) {
		this.id = id;
		this.title = title;
		this.company = company;
		this.summary = summary;
		this.premise = premise;
		this.provider = provider;
		this.link = link;
		this.minNotificationRating = minNotificationRating;
		this.workMode = workMode;
		this.location = location;
		this.salary = salary;
	}
}
