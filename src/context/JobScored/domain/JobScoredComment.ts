import { ValidationError } from "../../Shared/domain/ValidationError";
import { StringValueObject } from "../../Shared/domain/value-object/StringValueObject";

export class JobScoredComment extends StringValueObject {
	constructor(value: string) {
		super(value);
		this.ensureIsValid(value);
	}

	private ensureIsValid(value: string): void {
		if (value.length > 255) {
			throw new ValidationError("Comment cannot be longer than 255 characters");
		}
	}
}
