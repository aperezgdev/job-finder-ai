import type { EventBus } from "../../Shared/domain/event/EventBus";
import { JobCompany } from "../../Shared/domain/JobCompany";
import { JobLink } from "../../Shared/domain/JobLink";
import { JobLocation } from "../../Shared/domain/JobLocation";
import { JobPremise } from "../../Shared/domain/JobPremise";
import { JobProvider } from "../../Shared/domain/JobProvider";
import { JobSalary } from "../../Shared/domain/JobSalary";
import { JobSummary } from "../../Shared/domain/JobSummary";
import { JobTitle } from "../../Shared/domain/JobTitle";
import { JobWorkMode } from "../../Shared/domain/JobWorkMode";
import type { Logger } from "../../Shared/domain/Logger";
import type {
	JobScoredEvaluation,
	JobScoredRaterAI,
	JobScoredRaterInput,
} from "../domain/JobScoredRaterAI";
import { JobScoredRated } from "./JobScoredRated";

export type JobScoredRateInput = {
	jobOfferId: string;
	premise: string;
	title: string;
	summary: string;
	company: string;
	provider: string;
	link: string;
	minNotificationRating: number;
	workMode: string;
	location?: string;
	salary?: number;
};

export class JobScoredRater {
	constructor(
		private readonly eventBus: EventBus,
		private readonly raterAI: JobScoredRaterAI,
		private readonly logger: Logger,
	) {}

	async run(inputs: Array<JobScoredRateInput>): Promise<void> {
		if (inputs.length === 0) return;

		this.logger.info("JobScoredRater - run - Processing batch", {
			batchSize: inputs.length,
		});

		const raterInputs = inputs.map((input) => this.toRaterInput(input));
		const evaluations = await this.evaluateBatch(raterInputs);

		if (evaluations.length !== inputs.length) {
			throw new Error(
				`JobScoredRater - run - Invalid evaluation size. expected=${inputs.length} got=${evaluations.length}`,
			);
		}

		const events = inputs.map((input, index) => {
			const evaluation = evaluations[index];

			return new JobScoredRated({
				jobOfferId: input.jobOfferId,
				title: input.title,
				company: input.company,
				summary: input.summary,
				provider: input.provider,
				link: input.link,
				minNotificationRating: input.minNotificationRating,
				rating: evaluation.rating.value,
				comment: evaluation.comment.value,
				highlights: evaluation.highlights.value,
				workMode: input.workMode,
				location: input.location,
				salary: input.salary,
			});
		});

		await this.eventBus.publish(events);

		this.logger.info("JobScoredRater - run - Domain events published", {
			eventName: "job_scored_rated",
			batchSize: events.length,
		});
	}

	private toRaterInput(input: JobScoredRateInput): JobScoredRaterInput {
		return {
			id: input.jobOfferId,
			premise: new JobPremise(input.premise),
			title: new JobTitle(input.title),
			summary: new JobSummary(input.summary),
			company: new JobCompany(input.company),
			provider: new JobProvider(input.provider),
			link: new JobLink(input.link),
			workMode: new JobWorkMode(input.workMode),
			location: input.location ? new JobLocation(input.location) : undefined,
			salary: input.salary ? new JobSalary(input.salary) : undefined,
		};
	}

	private async evaluateBatch(
		raterInputs: Array<JobScoredRaterInput>,
	): Promise<Array<JobScoredEvaluation>> {
		return this.raterAI.rate(raterInputs);
	}
}
