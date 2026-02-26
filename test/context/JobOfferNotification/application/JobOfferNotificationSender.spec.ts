import { JobOfferNotificationSender } from "../../../../src/context/JobOfferNotification/application/JobOfferNotificationSender";
import type { JobOfferNotifier } from "../../../../src/context/JobOfferNotification/domain/JobOfferNotifier";

describe("JobOfferNotificationSender", () => {
	it("maps primitives into value objects and calls notifier", async () => {
		const notifier: JobOfferNotifier = {
			send: jest.fn().mockResolvedValue(undefined),
			sendScrapeSummary: jest.fn().mockResolvedValue(undefined),
		};

		const sender = new JobOfferNotificationSender(notifier);

		await sender.run({
			jobScoredId: "score-id",
			title: "Backend Engineer",
			summary: "Node.js role",
			company: "Acme",
			provider: "linkedin",
			link: "https://example.com/job/backend-engineer",
			rating: 4.5,
			comment: "Very good fit",
			highlights: ["Remote", "TypeScript"],
			salary: 50000,
			location: "Madrid",
			workMode: "remote",
		});

		expect(notifier.send).toHaveBeenCalledTimes(1);
		expect(notifier.send).toHaveBeenCalledWith({
			title: expect.objectContaining({ value: "Backend Engineer" }),
			summary: expect.objectContaining({ value: "Node.js role" }),
			company: expect.objectContaining({ value: "Acme" }),
			provider: expect.objectContaining({ value: "linkedin" }),
			link: expect.objectContaining({
				value: "https://example.com/job/backend-engineer",
			}),
			salary: expect.objectContaining({ value: 50000 }),
			location: expect.objectContaining({ value: "Madrid" }),
			workMode: expect.objectContaining({ value: "remote" }),
			rating: expect.objectContaining({ value: 4.5 }),
			comment: expect.objectContaining({ value: "Very good fit" }),
			highlights: expect.objectContaining({ value: ["Remote", "TypeScript"] }),
		});
	});
});
