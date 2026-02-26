import { JobOffer } from "../../../../src/context/JobOffer/domain/JobOffer";
import { JobCompany } from "../../../../src/context/Shared/domain/JobCompany";
import { JobLink } from "../../../../src/context/Shared/domain/JobLink";
import { JobLocation } from "../../../../src/context/Shared/domain/JobLocation";
import { JobMinNotificationRating } from "../../../../src/context/Shared/domain/JobMinNotificationRating";
import { JobPremise } from "../../../../src/context/Shared/domain/JobPremise";
import { JobProvider } from "../../../../src/context/Shared/domain/JobProvider";
import { JobSalary } from "../../../../src/context/Shared/domain/JobSalary";
import { JobSummary } from "../../../../src/context/Shared/domain/JobSummary";
import { JobTitle } from "../../../../src/context/Shared/domain/JobTitle";
import { JobWorkMode } from "../../../../src/context/Shared/domain/JobWorkMode";

describe("JobOffer aggregate", () => {
	it("creates an offer, records one domain event and serializes primitives", () => {
		const offer = JobOffer.create({
			title: new JobTitle("Backend Engineer"),
			company: new JobCompany("Acme"),
			summary: new JobSummary("Node.js role"),
			premise: new JobPremise("Remote backend jobs"),
			provider: new JobProvider("linkedin"),
			link: new JobLink("https://example.com/jobs/1"),
			minNotificationRating: new JobMinNotificationRating(4),
			workMode: new JobWorkMode("remote"),
			location: new JobLocation("Madrid"),
			salary: new JobSalary(50000),
		});

		const primitives = offer.toPrimitives();
		const events = offer.pullDomainEvents();

		expect(primitives).toMatchObject({
			title: "Backend Engineer",
			company: "Acme",
			summary: "Node.js role",
			premise: "Remote backend jobs",
			provider: "linkedin",
			link: "https://example.com/jobs/1",
			minNotificationRating: 4,
			workMode: "remote",
			location: "Madrid",
			salary: 50000,
		});
		expect(primitives.id).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
		);
		expect(events).toHaveLength(1);
		expect(events[0]).toEqual(
			expect.objectContaining({ eventName: "job_offer.created" }),
		);
		expect(offer.pullDomainEvents()).toEqual([]);
	});

	it("serializes optional fields as undefined when not provided", () => {
		const offer = JobOffer.create({
			title: new JobTitle("Backend Engineer"),
			company: new JobCompany("Acme"),
			summary: new JobSummary("Node.js role"),
			premise: new JobPremise("Remote backend jobs"),
			provider: new JobProvider("linkedin"),
			link: new JobLink("https://example.com/jobs/1"),
			minNotificationRating: new JobMinNotificationRating(4),
			workMode: new JobWorkMode("unspecified"),
		});

		expect(offer.toPrimitives()).toMatchObject({
			location: undefined,
			salary: undefined,
		});
	});
});
