import { ValidationError } from "./ValidationError";
import { NumberValueObject } from "./value-object/NumberValueObject";

export class JobMinNotificationRating extends NumberValueObject {
	constructor(value: number) {
		super(value);
		this.ensureIsValid(value);
	}

	static default(): JobMinNotificationRating {
		return new JobMinNotificationRating(4);
	}

	private ensureIsValid(value: number): void {
		if (value < 3 || value > 5) {
			throw new ValidationError(
				"Minimum notification rating must be between 3 and 5",
			);
		}

		if (value % 0.5 !== 0) {
			throw new ValidationError(
				"Minimum notification rating must be in increments of 0.5",
			);
		}
	}
}
