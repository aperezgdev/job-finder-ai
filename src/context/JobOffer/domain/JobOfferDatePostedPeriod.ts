import { ValidationError } from "../../Shared/domain/ValidationError";
import { EnumValueObject } from "../../Shared/domain/value-object/EnumValueObject";

export enum JobOfferDatePostedPeriodEnum {
	LAST_24_HOURS = "24h",
	LAST_WEEK = "week",
	LAST_MONTH = "month",
}

export class JobOfferDatePostedPeriod extends EnumValueObject<JobOfferDatePostedPeriodEnum> {
	constructor(value: string) {
		super(value as JobOfferDatePostedPeriodEnum, Object.values(JobOfferDatePostedPeriodEnum));
	}

	protected invalidValue(value: JobOfferDatePostedPeriodEnum): void {
		throw new ValidationError(`Invalid job offer date posted period: ${value}`);
	}
}
