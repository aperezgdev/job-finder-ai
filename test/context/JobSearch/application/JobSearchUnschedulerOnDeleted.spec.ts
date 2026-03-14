import { JobSearchUnscheduler } from "../../../../src/context/JobSearch/application/JobSearchUnscheduler";
import { JobSearchUnschedulerOnDeleted } from "../../../../src/context/JobSearch/application/JobSearchUnschedulerOnDeleted";
import { JobSearchDeleted } from "../../../../src/context/JobSearch/domain/JobSearchDeleted";
import type { JobSearchScheduler } from "../../../../src/context/JobSearch/domain/JobSearchScheduler";

describe("JobSearchUnschedulerOnDeleted", () => {
	it("subscribes to JobSearchDeleted", () => {
		const scheduler: JobSearchScheduler = {
			schedule: jest.fn().mockResolvedValue(undefined),
			unschedule: jest.fn().mockResolvedValue(undefined),
		};
		const jobSearchUnscheduler = new JobSearchUnscheduler(scheduler);
		const subscriber = new JobSearchUnschedulerOnDeleted(jobSearchUnscheduler);

		expect(subscriber.subscribedTo()).toEqual([JobSearchDeleted]);
	});

	it("maps event data and delegates unscheduling", async () => {
		const scheduler: JobSearchScheduler = {
			schedule: jest.fn().mockResolvedValue(undefined),
			unschedule: jest.fn().mockResolvedValue(undefined),
		};
		const jobSearchUnscheduler = new JobSearchUnscheduler(scheduler);
		const unschedulerSpy = jest.spyOn(jobSearchUnscheduler, "run");
		const subscriber = new JobSearchUnschedulerOnDeleted(jobSearchUnscheduler);
		const event = new JobSearchDeleted({
			id: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
			chatId: "123",
		});

		await subscriber.on(event);

		expect(unschedulerSpy).toHaveBeenCalledTimes(1);
		expect(unschedulerSpy).toHaveBeenCalledWith({
			chatId: "123",
			jobSearchId: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
		});
		expect(scheduler.unschedule).toHaveBeenCalledTimes(1);
	});
});
