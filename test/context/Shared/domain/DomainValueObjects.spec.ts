import {
	JobOfferDatePostedPeriod,
	JobOfferDatePostedPeriodEnum,
} from "../../../../src/context/JobOffer/domain/JobOfferDatePostedPeriod";
import { JobScoredComment } from "../../../../src/context/JobScored/domain/JobScoredComment";
import { JobScoredRating } from "../../../../src/context/JobScored/domain/JobScoredRating";
import { JobSearchFilter as JobSearchDomainFilter } from "../../../../src/context/JobSearch/domain/JobSearchFilter";
import {
	JobSearchPeriodicity,
	JobSearchPeriodicityEnum,
} from "../../../../src/context/JobSearch/domain/JobSearchPeriodicity";
import { JobSearchPremise } from "../../../../src/context/JobSearch/domain/JobSearchPremise";
import { JobMinNotificationRating } from "../../../../src/context/Shared/domain/JobMinNotificationRating";
import { JobPremise } from "../../../../src/context/Shared/domain/JobPremise";
import { JobProvider } from "../../../../src/context/Shared/domain/JobProvider";
import { JobSearchFilter } from "../../../../src/context/Shared/domain/JobSearchFilter";
import {
	JobWorkMode,
	JobWorkModeEnum,
} from "../../../../src/context/Shared/domain/JobWorkMode";
import { ValidationError } from "../../../../src/context/Shared/domain/ValidationError";

describe("Domain value objects validation", () => {
	it("validates minimum notification rating", () => {
		expect(new JobMinNotificationRating(4).value).toBe(4);
		expect(JobMinNotificationRating.default().value).toBe(4);
		expect(() => new JobMinNotificationRating(2.5)).toThrow(ValidationError);
		expect(() => new JobMinNotificationRating(4.3)).toThrow(ValidationError);
	});

	it("validates job scored rating", () => {
		expect(new JobScoredRating(0).value).toBe(0);
		expect(new JobScoredRating(4.5).value).toBe(4.5);
		expect(() => new JobScoredRating(6)).toThrow(ValidationError);
		expect(() => new JobScoredRating(4.3)).toThrow(ValidationError);
	});

	it("validates job scored comment max length", () => {
		expect(new JobScoredComment("ok").value).toBe("ok");
		expect(() => new JobScoredComment("a".repeat(256))).toThrow(
			ValidationError,
		);
	});

	it("validates premise and search filter value objects", () => {
		expect(new JobPremise("backend jobs").value).toBe("backend jobs");
		expect(new JobSearchPremise("backend jobs").value).toBe("backend jobs");
		expect(new JobSearchDomainFilter("backend remote").value).toBe(
			"backend remote",
		);
		expect(new JobSearchFilter("remote backend").value).toBe("remote backend");

		expect(() => new JobPremise("")).toThrow(ValidationError);
		expect(() => new JobPremise("a".repeat(256))).toThrow(ValidationError);
		expect(() => new JobSearchPremise("")).toThrow(ValidationError);
		expect(() => new JobSearchPremise("a".repeat(256))).toThrow(
			ValidationError,
		);
		expect(() => new JobSearchDomainFilter("")).toThrow(ValidationError);
		expect(() => new JobSearchFilter("")).toThrow(ValidationError);
	});

	it("validates enum based value objects", () => {
		expect(new JobWorkMode(JobWorkModeEnum.REMOTE).value).toBe("remote");
		expect(JobWorkMode.default().value).toBe("unspecified");
		expect(() => new JobWorkMode("invalid-mode")).toThrow(ValidationError);

		expect(new JobProvider("linkedin").value).toBe("linkedin");
		expect(() => new JobProvider("invalid-provider")).toThrow(ValidationError);

		expect(
			new JobSearchPeriodicity(JobSearchPeriodicityEnum.WEEKLY).value,
		).toBe("weekly");
		expect(JobSearchPeriodicity.default().value).toBe("daily");
		expect(() => new JobSearchPeriodicity("invalid")).toThrow(ValidationError);

		expect(
			new JobOfferDatePostedPeriod(JobOfferDatePostedPeriodEnum.LAST_WEEK)
				.value,
		).toBe("week");
		expect(() => new JobOfferDatePostedPeriod("invalid")).toThrow(
			ValidationError,
		);
	});
});
