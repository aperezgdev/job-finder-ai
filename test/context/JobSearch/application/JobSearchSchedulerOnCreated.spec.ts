import { JobSearchSchedulerOnCreated } from "../../../../src/context/JobSearch/application/JobSearchSchedulerOnCreated";
import { JobSearchCreated } from "../../../../src/context/JobSearch/domain/JobSearchCreated";
import type { JobSearchScheduler } from "../../../../src/context/JobSearch/domain/JobSearchScheduler";

describe("JobSearchSchedulerOnCreated", () => {
	it("subscribes to JobSearchCreated", () => {
		const scheduler: JobSearchScheduler = {
			schedule: jest.fn().mockResolvedValue(undefined),
			unschedule: jest.fn().mockResolvedValue(undefined),
		};
		const subscriber = new JobSearchSchedulerOnCreated(scheduler);

		expect(subscriber.subscribedTo()).toEqual([JobSearchCreated]);
	});

	it("maps event data and delegates scheduling", async () => {
		const scheduler: JobSearchScheduler = {
			schedule: jest.fn().mockResolvedValue(undefined),
			unschedule: jest.fn().mockResolvedValue(undefined),
		};
		const subscriber = new JobSearchSchedulerOnCreated(scheduler);
		const event = new JobSearchCreated({
			id: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
			premise: "Remote backend jobs",
			filter: "backend remote",
			periodicity: "weekly",
			scheduledAtUtcHour: "09:30",
			minNotificationRating: 4,
		});

		await subscriber.on(event);

		expect(scheduler.schedule).toHaveBeenCalledTimes(1);
		expect(scheduler.schedule).toHaveBeenCalledWith({
			jobSearchId: expect.objectContaining({
				value: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
			}),
			premise: expect.objectContaining({ value: "Remote backend jobs" }),
			filter: expect.objectContaining({ value: "backend remote" }),
			periodicity: expect.objectContaining({ value: "weekly" }),
			scheduledAtUtcHour: expect.objectContaining({ value: "09:30" }),
			minNotificationRating: expect.objectContaining({ value: 4 }),
		});
	});
});
