import type {
	DataSource,
	EntityTarget,
	ObjectLiteral,
	Repository as TypeORMRepository,
} from "typeorm";

export abstract class SQLiteRepository<T extends ObjectLiteral> {
	protected abstract entityClass: EntityTarget<T>;

	constructor(protected readonly dataSource: DataSource) {}

	protected getCollection(): TypeORMRepository<T> {
		return this.dataSource.getRepository(this.entityClass);
	}

	protected async merge(entity: T): Promise<void> {
		const repository = this.getCollection();
		await repository.save(entity);
	}
}
