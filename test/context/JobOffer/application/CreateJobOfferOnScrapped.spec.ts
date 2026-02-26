import { OnJobOffersScrapedCreator } from "../../../../src/context/JobOffer/application/CreateJobOfferOnScrapped";
import { JobOfferScrapped } from "../../../../src/context/JobOffer/application/JobOfferScrapped";

describe("OnJobOffersScrapedCreator", () => {
	it("subscribes to JobOfferScrapped events", () => {
		const creator = { create: jest.fn() };
		const subscriber = new OnJobOffersScrapedCreator(creator as never);

		expect(subscriber.subscribedTo()).toEqual([JobOfferScrapped]);
	});

	it("delegates event data to JobOfferCreator", async () => {
		const creator = {
			create: jest.fn().mockResolvedValue(undefined),
		};
		const subscriber = new OnJobOffersScrapedCreator(creator as never);
		const event = new JobOfferScrapped({
			title: "Backend Engineer",
			summary: "Node.js role",
			company: "Acme",
			premise: "Remote backend jobs",
			provider: "linkedin",
			link: "https://example.com/job/1",
			workMode: "remote",
			location: "Madrid",
			salary: 50000,
			minNotificationRating: 4,
		});

		await subscriber.on(event);

		expect(creator.create).toHaveBeenCalledTimes(1);
		expect(creator.create).toHaveBeenCalledWith({
			title: "Backend Engineer",
			company: "Acme",
			summary: "Node.js role",
			premise: "Remote backend jobs",
			provider: "linkedin",
			link: "https://example.com/job/1",
			workMode: "remote",
			location: "Madrid",
			salary: 50000,
			minNotificationRating: 4,
		});
	});
});
