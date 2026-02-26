export abstract class ArrayValueObject<T> {
	readonly value: T[]

	constructor(value: T[]) {
		this.value = value
	}
}
