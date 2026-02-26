import { ValidationError } from "../../Shared/domain/ValidationError";
import { StringValueObject } from "../../Shared/domain/value-object/StringValueObject";

export class JobSearchScheduledAtUtcHour extends StringValueObject {
	constructor(value: string) {
		super(value);
		this.ensureIsValid(value);
	}

	hour(): number {
		return Number(this.value.slice(0, 2));
	}

	minutes(): number {
		return Number(this.value.slice(3, 5));
	}

	static default(): JobSearchScheduledAtUtcHour {
		return new JobSearchScheduledAtUtcHour("09:00");
	}

	private ensureIsValid(value: string): void {
		if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
			throw new ValidationError(
				"Scheduled UTC hour must use HH:mm format between 00:00 and 23:59",
			);
		}
	}
}
