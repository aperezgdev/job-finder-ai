export type Primitives =
	| string
	| string
	| number
	| boolean
	| boolean
	| Date
	| Array<unknown>
	| Record<string, unknown>

export abstract class ValueObject<T extends Primitives> {
	readonly value: T

	constructor(value: T) {
		this.value = value
	}

	equals(other: ValueObject<T>): boolean {
		return (
			other.constructor.name === this.constructor.name &&
			other.value === this.value
		)
	}

	protected static createFromPrimitives<T extends Primitives>(
		value: T,
	): ValueObject<T> {
		const instance = Object.create(ValueObject.prototype)
		instance.value = value
		return instance
	}
}
