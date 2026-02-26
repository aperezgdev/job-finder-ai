import { ValidationError } from "./ValidationError";
import { EnumValueObject } from "./value-object/EnumValueObject";

export enum JobWorkModeEnum {
	REMOTE = "remote",
	HYBRID = "hybrid",
	ONSITE = "onsite",
	UNSPECIFIED = "unspecified",
}

export class JobWorkMode extends EnumValueObject<JobWorkModeEnum> {
	constructor(value: string) {
		super(value as JobWorkModeEnum, Object.values(JobWorkModeEnum));
	}

	static default(): JobWorkMode {
		return new JobWorkMode(JobWorkModeEnum.UNSPECIFIED);
	}

	protected invalidValue(value: JobWorkModeEnum): void {
		throw new ValidationError(`Invalid job work mode: ${value}`);
	}
}
