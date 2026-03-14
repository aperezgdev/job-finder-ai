import { ValidationError } from "../../Shared/domain/ValidationError";
import { StringValueObject } from "../../Shared/domain/value-object/StringValueObject";

export class UserProfileComment extends StringValueObject {
	constructor(value: string) {
		const normalized = value.trim();
		super(normalized);
		this.ensureIsValid(normalized);
	}

	private ensureIsValid(value: string): void {
		if (value.length > 512) {
			throw new ValidationError(
				"profileComment must be 512 characters or less",
			);
		}
	}
}
