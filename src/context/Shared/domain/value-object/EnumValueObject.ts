export abstract class EnumValueObject<T> {
	readonly value: T

	constructor(
		value: T,
		public readonly validValues: T[],
	) {
		this.value = value
		this.checkValueIsValid(value)
	}

	public checkValueIsValid(value: T): void {
		if (!this.validValues.includes(value)) {
			this.invalidValue(value)
		}
	}

	protected abstract invalidValue(value: T): void
}
