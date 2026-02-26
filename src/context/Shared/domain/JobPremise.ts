import { ValidationError } from "./ValidationError";
import { StringValueObject } from "./value-object/StringValueObject";

export class JobPremise extends StringValueObject {
	constructor(value: string) {
		super(value);
		this.ensureIsValid(value);
	}

	private ensureIsValid(value: string): void {
		if (value.length === 0 || value.length > 255) {
			throw new ValidationError(
				"Job premise must be between 1 and 255 characters",
			);
		}
	}
}
