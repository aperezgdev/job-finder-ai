import type { JobSearchFilter } from "../../Shared/domain/JobSearchFilter";
import type { JobOffer } from "./JobOffer";
import type { JobOfferDatePostedPeriod } from "./JobOfferDatePostedPeriod";

export interface JobOfferScrapper {
	getLastJobOffers(input: {
		searchFilter: JobSearchFilter;
		datePostedPeriod: JobOfferDatePostedPeriod;
	}): Promise<JobOffer[]>;
}
