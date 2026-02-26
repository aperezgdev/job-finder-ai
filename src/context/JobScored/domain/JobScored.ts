import { AggregateRoot } from "../../Shared/domain/AggregateRoot";
import type { JobCompany } from "../../Shared/domain/JobCompany";
import type { JobLink } from "../../Shared/domain/JobLink";
import type { JobLocation } from "../../Shared/domain/JobLocation";
import type { JobMinNotificationRating } from "../../Shared/domain/JobMinNotificationRating";
import type { JobOfferId } from "../../Shared/domain/JobOfferId";
import type { JobProvider } from "../../Shared/domain/JobProvider";
import type { JobSalary } from "../../Shared/domain/JobSalary";
import type { JobSummary } from "../../Shared/domain/JobSummary";
import type { JobTitle } from "../../Shared/domain/JobTitle";
import type { JobWorkMode } from "../../Shared/domain/JobWorkMode";
import type { JobScoredComment } from "./JobScoredComment";
import { JobScoredCreated } from "./JobScoredCreated";
import type { JobScoredHighlights } from "./JobScoredHighlights";
import { JobScoredId } from "./JobScoredId";
import type { JobScoredRating } from "./JobScoredRating";

export class JobScored extends AggregateRoot {
	private readonly id: JobScoredId;
	private readonly jobOfferId: JobOfferId;
	private readonly title: JobTitle;
	private readonly company: JobCompany;
	private readonly summary: JobSummary;
	private readonly provider: JobProvider;
	private readonly link: JobLink;
	private readonly minNotificationRating: JobMinNotificationRating;
	private readonly rating: JobScoredRating;
	private readonly comment: JobScoredComment;
	private readonly highlights: JobScoredHighlights;
	private readonly workMode: JobWorkMode;
	private readonly location?: JobLocation;
	private readonly salary?: JobSalary;

	constructor(
		id: JobScoredId,
		jobOfferId: JobOfferId,
		title: JobTitle,
		company: JobCompany,
		summary: JobSummary,
		provider: JobProvider,
		link: JobLink,
		minNotificationRating: JobMinNotificationRating,
		rating: JobScoredRating,
		comment: JobScoredComment,
		highlights: JobScoredHighlights,
		workMode: JobWorkMode,
		location?: JobLocation,
		salary?: JobSalary,
	) {
		super();
		this.id = id;
		this.jobOfferId = jobOfferId;
		this.title = title;
		this.company = company;
		this.summary = summary;
		this.provider = provider;
		this.link = link;
		this.minNotificationRating = minNotificationRating;
		this.rating = rating;
		this.comment = comment;
		this.highlights = highlights;
		this.workMode = workMode;
		this.location = location;
		this.salary = salary;
	}

	static create(
		jobOfferId: JobOfferId,
		title: JobTitle,
		company: JobCompany,
		summary: JobSummary,
		provider: JobProvider,
		link: JobLink,
		minNotificationRating: JobMinNotificationRating,
		rating: JobScoredRating,
		comment: JobScoredComment,
		highlights: JobScoredHighlights,
		workMode: JobWorkMode,
		location?: JobLocation,
		salary?: JobSalary,
	): JobScored {
		const id = JobScoredId.random();
		const jobScored = new JobScored(
			id,
			jobOfferId,
			title,
			company,
			summary,
			provider,
			link,
			minNotificationRating,
			rating,
			comment,
			highlights,
			workMode,
			location,
			salary,
		);

		jobScored.record(
			new JobScoredCreated({
				id: jobScored.id.value,
				title: jobScored.title.value,
				company: jobScored.company.value,
				summary: jobScored.summary.value,
				provider: jobScored.provider.value,
				link: jobScored.link.value,
				minNotificationRating: jobScored.minNotificationRating.value,
				rating: jobScored.rating.value,
				comment: jobScored.comment.value,
				highlights: jobScored.highlights.value,
				workMode: jobScored.workMode.value,
				location: jobScored.location?.value,
				salary: jobScored.salary?.value,
			}),
		);

		return jobScored;
	}

	toPrimitives(): {
		id: string;
		jobOfferId: string;
		title: string;
		company: string;
		summary: string;
		provider: string;
		link: string;
		minNotificationRating: number;
		rating: number;
		comment: string;
		highlights: string[];
		workMode: string;
		location?: string;
		salary?: number;
	} {
		return {
			id: this.id.value,
			jobOfferId: this.jobOfferId.value,
			title: this.title.value,
			company: this.company.value,
			summary: this.summary.value,
			provider: this.provider.value,
			link: this.link.value,
			minNotificationRating: this.minNotificationRating.value,
			rating: this.rating.value,
			comment: this.comment.value,
			highlights: this.highlights.value,
			workMode: this.workMode.value,
			location: this.location?.value,
			salary: this.salary?.value,
		};
	}
}
