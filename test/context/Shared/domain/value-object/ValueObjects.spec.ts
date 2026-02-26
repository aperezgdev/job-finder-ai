import { JobSearchId } from "../../../../../src/context/JobSearch/domain/JobSearchId";
import { JobLink } from "../../../../../src/context/Shared/domain/JobLink";
import { JobOfferId } from "../../../../../src/context/Shared/domain/JobOfferId";
import { ValidationError } from "../../../../../src/context/Shared/domain/ValidationError";
import { Uuid } from "../../../../../src/context/Shared/domain/value-object/Uuid";
import { ValueObject } from "../../../../../src/context/Shared/domain/value-object/ValueObject";

class DummyStringValueObject extends ValueObject<string> {
	static fromPrimitives(value: string): ValueObject<string> {
		return DummyStringValueObject.createFromPrimitives(value);
	}
}

describe("Shared value objects", () => {
	it("compares value objects with equals", () => {
		const left = new JobOfferId("018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a");
		const same = new JobOfferId("018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a");
		const different = new JobOfferId("018f6b5a-6b70-7cc6-b79f-4f88db0d1e2b");

		expect(left.equals(same)).toBe(true);
		expect(left.equals(different)).toBe(false);
	});

	it("supports createFromPrimitives through subclasses", () => {
		const fromPrimitives = DummyStringValueObject.fromPrimitives("raw-value");

		expect(fromPrimitives.value).toBe("raw-value");
	});

	it("validates urls in link value object", () => {
		expect(() => new JobLink("not-a-url")).toThrow(ValidationError);
		expect(() => new JobLink("https://example.com/jobs/123")).not.toThrow();
	});

	it("creates and validates uuids", () => {
		const generated = Uuid.random();
		const fromPrimitives = Uuid.fromPrimitives(
			"018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
		);

		expect(generated.value).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
		);
		expect(fromPrimitives.value).toBe("018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a");
		expect(() => new JobSearchId("invalid-id")).toThrow(ValidationError);
	});

	it("sets ValidationError name and message", () => {
		const error = new ValidationError("boom");

		expect(error.name).toBe("ValidationError");
		expect(error.message).toBe("boom");
	});
});
