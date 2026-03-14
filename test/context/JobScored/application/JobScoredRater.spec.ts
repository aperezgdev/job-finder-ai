import { JobScoredRater } from "../../../../src/context/JobScored/application/JobScoredRater";
import { JobScoredComment } from "../../../../src/context/JobScored/domain/JobScoredComment";
import { JobScoredHighlights } from "../../../../src/context/JobScored/domain/JobScoredHighlights";
import type { JobScoredRaterAI } from "../../../../src/context/JobScored/domain/JobScoredRaterAI";
import { JobScoredRating } from "../../../../src/context/JobScored/domain/JobScoredRating";
import type { EventBus } from "../../../../src/context/Shared/domain/event/EventBus";
import type { Logger } from "../../../../src/context/Shared/domain/Logger";
import type { UserProfileRepository } from "../../../../src/context/UserProfile/domain/UserProfileRepository";

describe("JobScoredRater", () => {
	it("rates with AI and publishes JobScoredRated event", async () => {
		const eventBus: EventBus = {
			publish: jest.fn().mockResolvedValue(undefined),
			addSuscriber: jest.fn(),
		};
		const raterAI: JobScoredRaterAI = {
			rate: jest.fn().mockResolvedValue([
				{
					rating: new JobScoredRating(4.5),
					comment: new JobScoredComment("Great opportunity"),
					highlights: new JobScoredHighlights(["Remote", "TypeScript"]),
				},
			]),
		};
		const logger: Logger = {
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		};
		const userProfileRepository: UserProfileRepository = {
			findByChatId: jest.fn().mockResolvedValue(null),
			save: jest.fn().mockResolvedValue(undefined),
			deleteByChatId: jest.fn().mockResolvedValue(true),
		};

		const rater = new JobScoredRater(
			eventBus,
			raterAI,
			logger,
			userProfileRepository,
		);

		await rater.run([
			{
				chatId: "123",
				jobOfferId: "offer-id",
				premise: "Remote backend jobs",
				title: "Backend Engineer",
				summary: "Node.js role",
				company: "Acme",
				provider: "linkedin",
				link: "https://example.com/job/1",
				minNotificationRating: 4,
				workMode: "remote",
				location: "Madrid",
				salary: 50000,
			},
		]);

		expect(raterAI.rate).toHaveBeenCalledTimes(1);
		expect(eventBus.publish).toHaveBeenCalledTimes(1);
		expect(eventBus.publish).toHaveBeenCalledWith([
			expect.objectContaining({
				eventName: "job_scored_rated",
				rating: 4.5,
				comment: "Great opportunity",
				highlights: ["Remote", "TypeScript"],
			}),
		]);
	});

	it("uses batch AI rating when available", async () => {
		const eventBus: EventBus = {
			publish: jest.fn().mockResolvedValue(undefined),
			addSuscriber: jest.fn(),
		};
		const raterAI: JobScoredRaterAI = {
			rate: jest.fn().mockResolvedValue([
				{
					rating: new JobScoredRating(4.5),
					comment: new JobScoredComment("Great opportunity"),
					highlights: new JobScoredHighlights(["Remote"]),
				},
				{
					rating: new JobScoredRating(3),
					comment: new JobScoredComment("Partial fit"),
					highlights: new JobScoredHighlights(["Hybrid"]),
				},
			]),
		};
		const logger: Logger = {
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		};
		const userProfileRepository: UserProfileRepository = {
			findByChatId: jest.fn().mockResolvedValue(null),
			save: jest.fn().mockResolvedValue(undefined),
			deleteByChatId: jest.fn().mockResolvedValue(true),
		};

		const rater = new JobScoredRater(
			eventBus,
			raterAI,
			logger,
			userProfileRepository,
		);

		await rater.run([
			{
				chatId: "123",
				jobOfferId: "offer-id-1",
				premise: "Remote backend jobs",
				title: "Backend Engineer",
				summary: "Node.js role",
				company: "Acme",
				provider: "linkedin",
				link: "https://example.com/job/1",
				minNotificationRating: 4,
				workMode: "remote",
				location: "Madrid",
				salary: 50000,
			},
			{
				chatId: "123",
				jobOfferId: "offer-id-2",
				premise: "Remote backend jobs",
				title: "Fullstack Engineer",
				summary: "React + Node",
				company: "Contoso",
				provider: "linkedin",
				link: "https://example.com/job/2",
				minNotificationRating: 4,
				workMode: "hybrid",
				location: "Barcelona",
				salary: 60000,
			},
		]);

		expect(raterAI.rate).toHaveBeenCalledTimes(1);
		expect(eventBus.publish).toHaveBeenCalledTimes(1);
		expect(eventBus.publish).toHaveBeenCalledWith([
			expect.objectContaining({ jobOfferId: "offer-id-1", rating: 4.5 }),
			expect.objectContaining({ jobOfferId: "offer-id-2", rating: 3 }),
		]);
	});
});
