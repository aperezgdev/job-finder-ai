import { ValidationError } from "../../Shared/domain/ValidationError";
import { EnumValueObject } from "../../Shared/domain/value-object/EnumValueObject";

export enum JobSearchPeriodicityEnum {
	DAILY = "daily",
	WEEKLY = "weekly",
	BIWEEKLY = "biweekly",
	MONTHLY = "monthly",
}

export class JobSearchPeriodicity extends EnumValueObject<JobSearchPeriodicityEnum> {
	constructor(value: string) {
		super(value as JobSearchPeriodicityEnum, Object.values(JobSearchPeriodicityEnum));
	}

	static default(): JobSearchPeriodicity {
		return new JobSearchPeriodicity(JobSearchPeriodicityEnum.DAILY);
	}

	protected invalidValue(value: JobSearchPeriodicityEnum): void {
		throw new ValidationError(`Invalid job search periodicity: ${value}`);
	}
}
