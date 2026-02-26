import { JobScoredCreator } from "../../../../src/context/JobScored/application/JobScoredCreator";
import type { JobScoredRepository } from "../../../../src/context/JobScored/domain/JobScoredRepository";
import type { EventBus } from "../../../../src/context/Shared/domain/event/EventBus";
import type { Logger } from "../../../../src/context/Shared/domain/Logger";

describe("JobScoredCreator", () => {
	it("saves the score and publishes domain events", async () => {
		const eventBus: EventBus = {
			publish: jest.fn().mockResolvedValue(undefined),
			addSuscriber: jest.fn(),
		};
		const jobScoredRepository: JobScoredRepository = {
			save: jest.fn().mockResolvedValue(undefined),
			searchAll: jest.fn().mockResolvedValue([]),
			searchByJobSearchPremise: jest.fn().mockResolvedValue([]),
		};
		const logger: Logger = {
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		};

		const creator = new JobScoredCreator(eventBus, jobScoredRepository, logger);

		await creator.run({
			jobOfferId: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
			title: "Backend Engineer",
			company: "Acme",
			summary: "Node.js role",
			provider: "linkedin",
			link: "https://example.com/job/1",
			minNotificationRating: 4,
			rating: 4.5,
			comment: "Very good fit",
			highlights: ["TypeScript", "Remote"],
			workMode: "remote",
			location: "Madrid",
			salary: 50000,
		});

		expect(jobScoredRepository.save).toHaveBeenCalledTimes(1);
		expect(eventBus.publish).toHaveBeenCalledTimes(1);
		expect(eventBus.publish).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({
					eventName: "job_scored.created",
				}),
			]),
		);
	});
});
