import { JobSearch } from "../../../../src/context/JobSearch/domain/JobSearch";
import { JobSearchFilter } from "../../../../src/context/JobSearch/domain/JobSearchFilter";
import { JobSearchId } from "../../../../src/context/JobSearch/domain/JobSearchId";
import { JobSearchPeriodicity } from "../../../../src/context/JobSearch/domain/JobSearchPeriodicity";
import { JobSearchPremise } from "../../../../src/context/JobSearch/domain/JobSearchPremise";
import { JobSearchScheduledAtUtcHour } from "../../../../src/context/JobSearch/domain/JobSearchScheduledAtUtcHour";
import { JobMinNotificationRating } from "../../../../src/context/Shared/domain/JobMinNotificationRating";

describe("JobSearch aggregate", () => {
	it("creates a job search, records event and serializes primitives", () => {
		const jobSearch = JobSearch.create({
			id: new JobSearchId("018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a"),
			chatId: "123",
			premise: new JobSearchPremise("Remote backend jobs"),
			filter: new JobSearchFilter("backend remote"),
			periodicity: new JobSearchPeriodicity("weekly"),
			scheduledAtUtcHour: new JobSearchScheduledAtUtcHour("09:30"),
			minNotificationRating: new JobMinNotificationRating(4),
		});

		expect(jobSearch.toPrimitives()).toEqual({
			id: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
			chatId: "123",
			premise: "Remote backend jobs",
			filter: "backend remote",
			periodicity: "weekly",
			scheduledAtUtcHour: "09:30",
			minNotificationRating: 4,
		});

		const events = jobSearch.pullDomainEvents();
		expect(events).toHaveLength(1);
		expect(events[0]).toEqual(
			expect.objectContaining({ eventName: "job_search.created" }),
		);
		expect(jobSearch.pullDomainEvents()).toEqual([]);
	});
});
