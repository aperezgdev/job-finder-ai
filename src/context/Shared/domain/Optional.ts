export class Optional<T> {
	private constructor(private readonly value: T | null) {}

	static of<T>(value: T): Optional<T> {
		if (value === null || value === undefined) {
			throw new Error("Cannot create Optional.of with null or undefined")
		}
		return new Optional<T>(value)
	}

	static ofNullable<T>(value: T | null | undefined): Optional<T> {
		return new Optional<T>(value === undefined ? null : value)
	}

	static empty<T>(): Optional<T> {
		return new Optional<T>(null)
	}

	isPresent(): boolean {
		return this.value !== null
	}

	get(): T {
		if (this.value === null) {
			throw new Error("No value present")
		}
		return this.value
	}

	orElse(other: T): T {
		return this.value !== null ? this.value : other
	}
}
