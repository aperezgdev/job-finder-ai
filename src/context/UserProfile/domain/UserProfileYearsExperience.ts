import { ValidationError } from "../../Shared/domain/ValidationError";
import { NumberValueObject } from "../../Shared/domain/value-object/NumberValueObject";

export class UserProfileYearsExperience extends NumberValueObject {
	constructor(value: number) {
		super(value);
		this.ensureIsValid(value);
	}

	private ensureIsValid(value: number): void {
		if (!Number.isFinite(value) || value < 0) {
			throw new ValidationError(
				"yearsExperience must be greater or equal to 0",
			);
		}
	}
}
