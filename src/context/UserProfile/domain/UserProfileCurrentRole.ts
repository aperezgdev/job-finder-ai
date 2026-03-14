import { ValidationError } from "../../Shared/domain/ValidationError";
import { StringValueObject } from "../../Shared/domain/value-object/StringValueObject";

export class UserProfileCurrentRole extends StringValueObject {
	constructor(value: string) {
		const normalized = value.trim();
		super(normalized);
		this.ensureIsValid(normalized);
	}

	private ensureIsValid(value: string): void {
		if (value.length === 0) {
			throw new ValidationError("currentRole is required");
		}
	}
}
