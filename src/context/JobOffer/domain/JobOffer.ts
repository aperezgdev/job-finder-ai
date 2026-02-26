import { AggregateRoot } from "../../Shared/domain/AggregateRoot";
import type { JobCompany } from "../../Shared/domain/JobCompany";
import type { JobLink } from "../../Shared/domain/JobLink";
import type { JobLocation } from "../../Shared/domain/JobLocation";
import type { JobMinNotificationRating } from "../../Shared/domain/JobMinNotificationRating";
import { JobOfferId } from "../../Shared/domain/JobOfferId";
import type { JobPremise } from "../../Shared/domain/JobPremise";
import type { JobProvider } from "../../Shared/domain/JobProvider";
import type { JobSalary } from "../../Shared/domain/JobSalary";
import type { JobSummary } from "../../Shared/domain/JobSummary";
import type { JobTitle } from "../../Shared/domain/JobTitle";
import type { JobWorkMode } from "../../Shared/domain/JobWorkMode";
import { JobOfferCreated } from "./JobOfferCreated";

export class JobOffer extends AggregateRoot {
	constructor(
		private readonly id: JobOfferId,
		private readonly title: JobTitle,
		private readonly company: JobCompany,
		private readonly summary: JobSummary,
		private readonly premise: JobPremise,
		private readonly provider: JobProvider,
		private readonly link: JobLink,
		private readonly minNotificationRating: JobMinNotificationRating,
		private readonly workMode: JobWorkMode,
		private readonly location?: JobLocation,
		private readonly salary?: JobSalary,
	) {
		super();
	}

	public static create({
		title,
		company,
		summary,
		premise,
		provider,
		link,
		minNotificationRating,
		workMode,
		location,
		salary,
	}: {
		title: JobTitle;
		company: JobCompany;
		summary: JobSummary;
		premise: JobPremise;
		provider: JobProvider;
		link: JobLink;
		minNotificationRating: JobMinNotificationRating;
		workMode: JobWorkMode;
		location?: JobLocation;
		salary?: JobSalary;
	}): JobOffer {
		const jobOffer = new JobOffer(
			JobOfferId.random(),
			title,
			company,
			summary,
			premise,
			provider,
			link,
			minNotificationRating,
			workMode,
			location,
			salary,
		);

		jobOffer.record(
			new JobOfferCreated({
				id: jobOffer.id.value,
				title: title.value,
				company: company.value,
				summary: summary.value,
				premise: premise.value,
				provider: provider.value,
				link: link.value,
				minNotificationRating: minNotificationRating.value,
				workMode: workMode.value,
				location: location?.value,
				salary: salary?.value,
			}),
		);

		return jobOffer;
	}
	toPrimitives(): {
		id: string;
		title: string;
		company: string;
		summary: string;
		premise: string;
		provider: string;
		link: string;
		minNotificationRating: number;
		workMode: string;
		location?: string;
		salary?: number;
	} {
		return {
			id: this.id.value,
			title: this.title.value,
			company: this.company.value,
			summary: this.summary.value,
			premise: this.premise.value,
			provider: this.provider.value,
			link: this.link.value,
			minNotificationRating: this.minNotificationRating.value,
			workMode: this.workMode.value,
			location: this.location?.value,
			salary: this.salary?.value,
		};
	}
}
