import { JobMinNotificationRating } from "../../Shared/domain/JobMinNotificationRating";
import { SQLiteRepository } from "../../Shared/infrastructure/SQLiteRepository";
import { JobSearch } from "../domain/JobSearch";
import { JobSearchFilter } from "../domain/JobSearchFilter";
import { JobSearchId } from "../domain/JobSearchId";
import { JobSearchPeriodicity } from "../domain/JobSearchPeriodicity";
import { JobSearchPremise } from "../domain/JobSearchPremise";
import type { JobSearchRepository } from "../domain/JobSearchRepository";
import { JobSearchScheduledAtUtcHour } from "../domain/JobSearchScheduledAtUtcHour";
import { JobSearchEntity } from "./JobSearchEntity";

export class SQLiteJobSearchRepository
	extends SQLiteRepository<JobSearchEntity>
	implements JobSearchRepository
{
	protected entityClass = JobSearchEntity;

	private toDomain(entity: JobSearchEntity): JobSearch {
		return JobSearch.fromPrimitives({
			id: new JobSearchId(entity.id),
			premise: new JobSearchPremise(entity.premise),
			filter: new JobSearchFilter(entity.filter),
			periodicity: new JobSearchPeriodicity(entity.periodicity),
			scheduledAtUtcHour: new JobSearchScheduledAtUtcHour(
				entity.scheduledAtUtcHour,
			),
			minNotificationRating: new JobMinNotificationRating(
				entity.minNotificationRating,
			),
		});
	}

	async save(jobSearch: JobSearch): Promise<void> {
		const {
			id,
			premise,
			filter,
			periodicity,
			scheduledAtUtcHour,
			minNotificationRating,
		} = jobSearch.toPrimitives();
		const entity = new JobSearchEntity(
			id,
			premise,
			filter,
			periodicity,
			scheduledAtUtcHour,
			minNotificationRating,
		);
		await this.merge(entity);
	}

	async findById(jobSearchId: string): Promise<JobSearch | null> {
		const entity = await this.getCollection().findOneBy({ id: jobSearchId });
		if (!entity) {
			return null;
		}

		return this.toDomain(entity);
	}

	async searchAll(): Promise<Array<JobSearch>> {
		const entities = await this.getCollection().find({
			order: {
				premise: "ASC",
			},
		});

		return entities.map((entity) => this.toDomain(entity));
	}

	async deleteById(jobSearchId: string): Promise<void> {
		await this.getCollection().delete({ id: jobSearchId });
	}

	async deleteAll(): Promise<void> {
		await this.getCollection().clear();
	}
}
