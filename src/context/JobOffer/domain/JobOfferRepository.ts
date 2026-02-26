import type { JobOffer } from "./JobOffer";

export interface JobOfferRepository {
	save(jobOffer: JobOffer): Promise<void>;
}
