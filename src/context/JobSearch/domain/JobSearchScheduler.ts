import type { JobMinNotificationRating } from "../../Shared/domain/JobMinNotificationRating";
import type { JobSearchFilter } from "./JobSearchFilter";
import type { JobSearchId } from "./JobSearchId";
import type { JobSearchPeriodicity } from "./JobSearchPeriodicity";
import type { JobSearchPremise } from "./JobSearchPremise";
import type { JobSearchScheduledAtUtcHour } from "./JobSearchScheduledAtUtcHour";

export interface JobSearchScheduler {
	schedule(payload: {
		jobSearchId: JobSearchId;
		premise: JobSearchPremise;
		filter: JobSearchFilter;
		periodicity: JobSearchPeriodicity;
		scheduledAtUtcHour: JobSearchScheduledAtUtcHour;
		minNotificationRating: JobMinNotificationRating;
	}): Promise<void>;
	unschedule(payload: { jobSearchId: JobSearchId }): Promise<void>;
}
