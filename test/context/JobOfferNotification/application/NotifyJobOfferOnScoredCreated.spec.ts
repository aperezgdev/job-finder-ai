import { NotifyJobOfferOnScoredCreated } from "../../../../src/context/JobOfferNotification/application/NotifyJobOfferOnScoredCreated";
import { JobScoredCreated } from "../../../../src/context/JobScored/domain/JobScoredCreated";

describe("NotifyJobOfferOnScoredCreated", () => {
	it("subscribes to JobScoredCreated", () => {
		const sender = { run: jest.fn() };
		const subscriber = new NotifyJobOfferOnScoredCreated(sender as never);

		expect(subscriber.subscribedTo()).toEqual([JobScoredCreated]);
	});

	it("does not notify when rating is lower than minNotificationRating", async () => {
		const sender = {
			run: jest.fn().mockResolvedValue(undefined),
		};
		const subscriber = new NotifyJobOfferOnScoredCreated(sender as never);
		const event = new JobScoredCreated({
			id: "score-id",
			chatId: "123",
			title: "Backend Engineer",
			summary: "Node.js role",
			company: "Acme",
			provider: "linkedin",
			link: "https://example.com/job/backend-engineer",
			minNotificationRating: 4.5,
			rating: 4,
			comment: "Ok fit",
			highlights: ["TypeScript"],
			workMode: "remote",
			location: "Madrid",
			salary: 50000,
		});

		await subscriber.on(event);

		expect(sender.run).not.toHaveBeenCalled();
	});

	it("notifies when rating reaches minNotificationRating", async () => {
		const sender = {
			run: jest.fn().mockResolvedValue(undefined),
		};
		const subscriber = new NotifyJobOfferOnScoredCreated(sender as never);
		const event = new JobScoredCreated({
			id: "score-id",
			chatId: "123",
			title: "Backend Engineer",
			summary: "Node.js role",
			company: "Acme",
			provider: "linkedin",
			link: "https://example.com/job/backend-engineer",
			minNotificationRating: 4,
			rating: 4.5,
			comment: "Great fit",
			highlights: ["TypeScript", "Remote"],
			workMode: "remote",
			location: "Madrid",
			salary: 50000,
		});

		await subscriber.on(event);

		expect(sender.run).toHaveBeenCalledTimes(1);
		expect(sender.run).toHaveBeenCalledWith({
			chatId: "123",
			jobScoredId: "score-id",
			title: "Backend Engineer",
			summary: "Node.js role",
			company: "Acme",
			provider: "linkedin",
			link: "https://example.com/job/backend-engineer",
			comment: "Great fit",
			highlights: ["TypeScript", "Remote"],
			salary: 50000,
			location: "Madrid",
			workMode: "remote",
			rating: 4.5,
		});
	});
});
