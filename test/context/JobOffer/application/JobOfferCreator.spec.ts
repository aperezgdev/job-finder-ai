import { JobOfferCreator } from "../../../../src/context/JobOffer/application/JobOfferCreator";
import type { JobOfferRepository } from "../../../../src/context/JobOffer/domain/JobOfferRepository";
import type { EventBus } from "../../../../src/context/Shared/domain/event/EventBus";
import type { Logger } from "../../../../src/context/Shared/domain/Logger";

describe("JobOfferCreator", () => {
	it("saves the job offer and publishes its domain events", async () => {
		const jobOfferRepository: JobOfferRepository = {
			save: jest.fn().mockResolvedValue(undefined),
		};
		const eventBus: EventBus = {
			publish: jest.fn().mockResolvedValue(undefined),
			addSuscriber: jest.fn(),
		};
		const logger: Logger = {
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		};

		const creator = new JobOfferCreator(jobOfferRepository, eventBus, logger);

		await creator.create({
			title: "Backend Engineer",
			company: "Acme",
			summary: "Node.js role",
			premise: "Remote backend jobs",
			provider: "linkedin",
			link: "https://example.com/job/1",
			minNotificationRating: 4,
			workMode: "remote",
			location: "Madrid",
			salary: 50000,
		});

		expect(jobOfferRepository.save).toHaveBeenCalledTimes(1);
		expect(eventBus.publish).toHaveBeenCalledTimes(1);
		expect(eventBus.publish).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({
					eventName: "job_offer.created",
				}),
			]),
		);
	});

	it("defaults workMode, location and salary when omitted", async () => {
		const jobOfferRepository: JobOfferRepository = {
			save: jest.fn().mockResolvedValue(undefined),
		};
		const eventBus: EventBus = {
			publish: jest.fn().mockResolvedValue(undefined),
			addSuscriber: jest.fn(),
		};
		const logger: Logger = {
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		};

		const creator = new JobOfferCreator(jobOfferRepository, eventBus, logger);

		await creator.create({
			title: "Backend Engineer",
			company: "Acme",
			summary: "Node.js role",
			premise: "Remote backend jobs",
			provider: "linkedin",
			link: "https://example.com/job/1",
			minNotificationRating: 4,
		});

		expect(jobOfferRepository.save).toHaveBeenCalledTimes(1);
		expect(eventBus.publish).toHaveBeenCalledTimes(1);
		expect(eventBus.publish).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({
					workMode: "unspecified",
					location: "",
					salary: 0,
				}),
			]),
		);
	});
});
