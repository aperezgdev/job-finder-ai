import { JobOfferCreated } from "../../../../src/context/JobOffer/domain/JobOfferCreated";
import { RateJobScoredOnOfferCreated } from "../../../../src/context/JobScored/application/RateJobScoredOnOfferCreated";

describe("RateJobScoredOnOfferCreated", () => {
	afterEach(() => {
		jest.useRealTimers();
	});

	it("subscribes to JobOfferCreated events", () => {
		const jobScoredRater = { run: jest.fn() };
		const subscriber = new RateJobScoredOnOfferCreated(jobScoredRater as never);

		expect(subscriber.subscribedTo()).toEqual([JobOfferCreated]);
	});

	it("delegates event payload to JobScoredRater in a debounced batch", async () => {
		jest.useFakeTimers();
		const jobScoredRater = {
			run: jest.fn().mockResolvedValue(undefined),
		};
		const subscriber = new RateJobScoredOnOfferCreated(jobScoredRater as never);
		const event = new JobOfferCreated({
			id: "offer-id",
			title: "Backend Engineer",
			summary: "Node.js role",
			company: "Acme",
			premise: "Remote backend jobs",
			provider: "linkedin",
			link: "https://example.com/job/1",
			minNotificationRating: 4,
			workMode: "remote",
			location: "Madrid",
			salary: 50000,
		});

		await subscriber.on(event);
		expect(jobScoredRater.run).not.toHaveBeenCalled();

		await jest.advanceTimersByTimeAsync(2000);

		expect(jobScoredRater.run).toHaveBeenCalledTimes(1);
		expect(jobScoredRater.run).toHaveBeenCalledWith([
			{
				jobOfferId: "offer-id",
				premise: "Remote backend jobs",
				title: "Backend Engineer",
				company: "Acme",
				summary: "Node.js role",
				provider: "linkedin",
				link: "https://example.com/job/1",
				minNotificationRating: 4,
				workMode: "remote",
				location: "Madrid",
				salary: 50000,
			},
		]);
	});

	it("flushes pending events explicitly", async () => {
		const jobScoredRater = {
			run: jest.fn().mockResolvedValue(undefined),
		};
		const subscriber = new RateJobScoredOnOfferCreated(jobScoredRater as never);

		await subscriber.on(
			new JobOfferCreated({
				id: "offer-id",
				title: "Backend Engineer",
				summary: "Node.js role",
				company: "Acme",
				premise: "Remote backend jobs",
				provider: "linkedin",
				link: "https://example.com/job/1",
				minNotificationRating: 4,
				workMode: "remote",
				location: "Madrid",
				salary: 50000,
			}),
		);

		await subscriber.flushPending();

		expect(jobScoredRater.run).toHaveBeenCalledTimes(1);
	});
});
