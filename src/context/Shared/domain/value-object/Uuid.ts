import { v7, validate } from "uuid"
import { ValidationError } from "../ValidationError"
import { StringValueObject } from "./StringValueObject"

export class Uuid extends StringValueObject {
	constructor(value: string) {
		super(value)
		this.ensureIsValid(value)
	}

	static random(): Uuid {
		return new Uuid(v7())
	}

	static fromPrimitives(value: string): Uuid {
		return new Uuid(value)
	}

	private ensureIsValid(id: string) {
		if (!validate(id)) {
			throw new ValidationError(
				`<${this.constructor.name}> does not allow the value <${id}>`,
			)
		}
	}
}
