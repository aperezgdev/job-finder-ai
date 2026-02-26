import type { JobSearchId } from "../../JobSearch/domain/JobSearchId";
import type { JobPremise } from "../../Shared/domain/JobPremise";
import type { JobOfferNotifier } from "../domain/JobOfferNotifier";

export class JobOfferScrapeSummaryNotificationSender {
	constructor(private readonly notifier: JobOfferNotifier) {}

	async run({
		jobSearchId,
		premise,
		totalScraped,
	}: {
		jobSearchId: JobSearchId;
		premise: JobPremise;
		totalScraped: number;
	}): Promise<void> {
		await this.notifier.sendScrapeSummary({
			jobSearchId: jobSearchId.value,
			premise: premise.value,
			totalScraped,
		});
	}
}
