import { CreateJobScoredOnRated } from "../../../../src/context/JobScored/application/CreateJobScoredOnRated";
import { JobScoredRated } from "../../../../src/context/JobScored/application/JobScoredRated";

describe("CreateJobScoredOnRated", () => {
	it("subscribes to JobScoredRated events", () => {
		const jobScoredCreator = { run: jest.fn() };
		const subscriber = new CreateJobScoredOnRated(jobScoredCreator as never);

		expect(subscriber.subscribedTo()).toEqual([JobScoredRated]);
	});

	it("delegates event data to JobScoredCreator", async () => {
		const jobScoredCreator = {
			run: jest.fn().mockResolvedValue(undefined),
		};
		const subscriber = new CreateJobScoredOnRated(jobScoredCreator as never);
		const event = new JobScoredRated({
			jobOfferId: "offer-id",
			title: "Backend Engineer",
			summary: "Node.js role",
			company: "Acme",
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

		await subscriber.on(event);

		expect(jobScoredCreator.run).toHaveBeenCalledTimes(1);
		expect(jobScoredCreator.run).toHaveBeenCalledWith({
			jobOfferId: "offer-id",
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
	});
});
