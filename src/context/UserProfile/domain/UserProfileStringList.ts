import { ArrayValueObject } from "../../Shared/domain/value-object/ArrayValueObject";

function normalizeList(values: string[]): string[] {
	return Array.from(
		new Set(
			values
				.map((value) => value.trim())
				.filter((value) => value.length > 0)
				.map((value) => value.toLowerCase()),
		),
	);
}

export abstract class UserProfileStringList extends ArrayValueObject<string> {
	constructor(value: string[]) {
		super(normalizeList(value));
	}
}
