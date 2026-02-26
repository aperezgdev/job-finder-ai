import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "job_scored" })
export class JobScoredEntity {
	@PrimaryColumn("text")
	id!: string;

	@Column("text")
	jobOfferId!: string;

	@Column("text")
	title!: string;

	@Column("text")
	company!: string;

	@Column("text")
	summary!: string;

	@Column("text")
	provider!: string;

	@Column("text")
	link!: string;

	@Column("text")
	workMode!: string;

	@Column("text", { nullable: true })
	location?: string;

	@Column("real", { nullable: true })
	salary?: number;

	@Column("real")
	rating!: number;

	@Column("text")
	comment!: string;

	@Column("simple-json")
	highlights!: string[];

	constructor(
		id: string,
		jobOfferId: string,
		title: string,
		company: string,
		summary: string,
		provider: string,
		link: string,
		rating: number,
		comment: string,
		highlights: string[],
		workMode: string,
		location?: string,
		salary?: number,
	) {
		this.id = id;
		this.jobOfferId = jobOfferId;
		this.title = title;
		this.company = company;
		this.summary = summary;
		this.provider = provider;
		this.link = link;
		this.workMode = workMode;
		this.location = location;
		this.salary = salary;
		this.rating = rating;
		this.comment = comment;
		this.highlights = highlights;
	}
}
