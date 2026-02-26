import type { EventBus } from "../../Shared/domain/event/EventBus";
import { JobMinNotificationRating } from "../../Shared/domain/JobMinNotificationRating";
import { JobSearchId } from "../domain/JobSearchId";
import { JobSearchPremise } from "../domain/JobSearchPremise";
import type { JobSearchPremiseAnalyzer } from "../domain/JobSearchPremiseAnalyzer";
import { JobSearchPremiseAnalyzed } from "./JobSearchPremiseAnalyzed";

export class JobSearchPremiseAnalyze {
	constructor(
		private readonly analyzer: JobSearchPremiseAnalyzer,
		private readonly eventBus: EventBus,
	) {}

	async run({
		premise,
		periodicity,
		scheduledAtUtcHour,
		minNotificationRating,
	}: {
		premise: string;
		periodicity: string;
		scheduledAtUtcHour: string;
		minNotificationRating?: number;
	}): Promise<void> {
		const jobSearchId = JobSearchId.random();
		const jobSearchPremise = new JobSearchPremise(premise);
		const filter = await this.analyzer.analyze(jobSearchPremise);
		const resolvedMinNotificationRating =
			minNotificationRating !== undefined
				? new JobMinNotificationRating(minNotificationRating).value
				: JobMinNotificationRating.default().value;

		await this.eventBus.publish([
			new JobSearchPremiseAnalyzed({
				jobSearchId: jobSearchId.value,
				premise: jobSearchPremise.value,
				filter: filter.value,
				minNotificationRating: resolvedMinNotificationRating,
				periodicity: periodicity,
				scheduledAtUtcHour,
			}),
		]);
	}
}
