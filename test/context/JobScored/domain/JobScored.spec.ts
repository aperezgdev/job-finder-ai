import { JobScored } from "../../../../src/context/JobScored/domain/JobScored";
import { JobScoredComment } from "../../../../src/context/JobScored/domain/JobScoredComment";
import { JobScoredHighlights } from "../../../../src/context/JobScored/domain/JobScoredHighlights";
import { JobScoredRating } from "../../../../src/context/JobScored/domain/JobScoredRating";
import { JobCompany } from "../../../../src/context/Shared/domain/JobCompany";
import { JobLink } from "../../../../src/context/Shared/domain/JobLink";
import { JobLocation } from "../../../../src/context/Shared/domain/JobLocation";
import { JobMinNotificationRating } from "../../../../src/context/Shared/domain/JobMinNotificationRating";
import { JobOfferId } from "../../../../src/context/Shared/domain/JobOfferId";
import { JobProvider } from "../../../../src/context/Shared/domain/JobProvider";
import { JobSalary } from "../../../../src/context/Shared/domain/JobSalary";
import { JobSummary } from "../../../../src/context/Shared/domain/JobSummary";
import { JobTitle } from "../../../../src/context/Shared/domain/JobTitle";
import { JobWorkMode } from "../../../../src/context/Shared/domain/JobWorkMode";

describe("JobScored aggregate", () => {
	it("creates a score, records event and maps all primitives", () => {
		const jobScored = JobScored.create(
			new JobOfferId("018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a"),
			new JobTitle("Backend Engineer"),
			new JobCompany("Acme"),
			new JobSummary("Node.js role"),
			new JobProvider("linkedin"),
			new JobLink("https://example.com/jobs/1"),
			new JobMinNotificationRating(4),
			new JobScoredRating(4.5),
			new JobScoredComment("Great fit"),
			new JobScoredHighlights(["Remote", "TypeScript"]),
			new JobWorkMode("remote"),
			new JobLocation("Madrid"),
			new JobSalary(50000),
		);

		const primitives = jobScored.toPrimitives();

		expect(primitives).toMatchObject({
			jobOfferId: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
			title: "Backend Engineer",
			company: "Acme",
			summary: "Node.js role",
			provider: "linkedin",
			link: "https://example.com/jobs/1",
			minNotificationRating: 4,
			rating: 4.5,
			comment: "Great fit",
			highlights: ["Remote", "TypeScript"],
			workMode: "remote",
			location: "Madrid",
			salary: 50000,
		});
		expect(primitives.id).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
		);

		const events = jobScored.pullDomainEvents();
		expect(events).toHaveLength(1);
		expect(events[0]).toEqual(
			expect.objectContaining({ eventName: "job_scored.created" }),
		);
	});

	it("maps optional location and salary as undefined when omitted", () => {
		const jobScored = JobScored.create(
			new JobOfferId("018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a"),
			new JobTitle("Backend Engineer"),
			new JobCompany("Acme"),
			new JobSummary("Node.js role"),
			new JobProvider("linkedin"),
			new JobLink("https://example.com/jobs/1"),
			new JobMinNotificationRating(4),
			new JobScoredRating(4),
			new JobScoredComment("Good fit"),
			new JobScoredHighlights(["Remote"]),
			new JobWorkMode("unspecified"),
		);

		expect(jobScored.toPrimitives()).toMatchObject({
			location: undefined,
			salary: undefined,
		});
	});
});
