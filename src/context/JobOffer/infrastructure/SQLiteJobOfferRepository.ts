import { SQLiteRepository } from "../../Shared/infrastructure/SQLiteRepository";
import type { JobOffer } from "../domain/JobOffer";
import type { JobOfferRepository } from "../domain/JobOfferRepository";
import { JobOfferEntity } from "./JobOfferEntity";

export class SQLiteJobOfferRepository
	extends SQLiteRepository<JobOfferEntity>
	implements JobOfferRepository
{
	protected entityClass = JobOfferEntity;

	async save(jobOffer: JobOffer): Promise<void> {
		const {
			id,
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
		} = jobOffer.toPrimitives();
		const entity = new JobOfferEntity(
			id,
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
		await this.merge(entity);
	}
}
