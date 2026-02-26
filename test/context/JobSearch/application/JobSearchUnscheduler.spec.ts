import { JobSearchUnscheduler } from "../../../../src/context/JobSearch/application/JobSearchUnscheduler";
import type { JobSearchScheduler } from "../../../../src/context/JobSearch/domain/JobSearchScheduler";

describe("JobSearchUnscheduler", () => {
	it("delegates unschedule with a JobSearchId", async () => {
		const scheduler: JobSearchScheduler = {
			schedule: jest.fn().mockResolvedValue(undefined),
			unschedule: jest.fn().mockResolvedValue(undefined),
		};
		const useCase = new JobSearchUnscheduler(scheduler);

		await useCase.run({
			jobSearchId: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
		});

		expect(scheduler.unschedule).toHaveBeenCalledTimes(1);
		expect(scheduler.unschedule).toHaveBeenCalledWith({
			jobSearchId: expect.objectContaining({
				value: "018f6b5a-6b70-7cc6-b79f-4f88db0d1e2a",
			}),
		});
	});
});
