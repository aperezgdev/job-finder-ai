import { SQLiteRepository } from "../../Shared/infrastructure/SQLiteRepository";
import type { JobScored } from "../domain/JobScored";
import type {
	JobScoredRepository,
	JobScoredSummary,
} from "../domain/JobScoredRepository";
import { JobScoredEntity } from "./JobScoredEntity";

export class SQLiteJobScoredRepository
	extends SQLiteRepository<JobScoredEntity>
	implements JobScoredRepository
{
	protected entityClass = JobScoredEntity;

	private toSummary(entity: JobScoredEntity): JobScoredSummary {
		return {
			id: entity.id,
			jobOfferId: entity.jobOfferId,
			title: entity.title,
			company: entity.company,
			summary: entity.summary,
			provider: entity.provider,
			link: entity.link,
			rating: entity.rating,
			comment: entity.comment,
			highlights: entity.highlights,
			workMode: entity.workMode,
			location: entity.location,
			salary: entity.salary,
		};
	}

	async save(chatId: string, jobScored: JobScored): Promise<void> {
		const {
			id,
			jobOfferId,
			title,
			company,
			summary,
			provider,
			link,
			rating,
			comment,
			highlights,
			workMode,
			location,
			salary,
		} = jobScored.toPrimitives();
		const entity = new JobScoredEntity(
			id,
			chatId,
			jobOfferId,
			title,
			company,
			summary,
			provider,
			link,
			rating,
			comment,
			highlights,
			workMode,
			location ?? undefined,
			salary ?? undefined,
		);
		await this.merge(entity);
	}

	async searchAllByChatId(chatId: string): Promise<Array<JobScoredSummary>> {
		const entities = await this.getCollection().find({
			where: {
				chatId,
			},
			order: {
				rating: "DESC",
				title: "ASC",
			},
		});

		return entities.map((entity) => this.toSummary(entity));
	}

	async searchByJobSearchPremise(
		premise: string,
		chatId: string,
	): Promise<Array<JobScoredSummary>> {
		const entities = await this.getCollection()
			.createQueryBuilder("job_scored")
			.innerJoin(
				"job_offers",
				"job_offers",
				"job_offers.id = job_scored.jobOfferId AND job_offers.chatId = job_scored.chatId",
			)
			.where("job_offers.premise = :premise", { premise })
			.andWhere("job_scored.chatId = :chatId", { chatId })
			.orderBy("job_scored.rating", "DESC")
			.addOrderBy("job_scored.title", "ASC")
			.getMany();

		return entities.map((entity) => this.toSummary(entity));
	}
}
