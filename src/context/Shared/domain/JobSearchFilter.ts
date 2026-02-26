import { ValidationError } from "./ValidationError";
import { StringValueObject } from "./value-object/StringValueObject";

export class JobSearchFilter extends StringValueObject {
	constructor(value: string) {
		super(value);
		this.ensureIsValid(value);
	}

	private ensureIsValid(value: string): void {
		if (value.length === 0) {
			throw new ValidationError("Job search filter cannot be empty");
		}
	}
}
