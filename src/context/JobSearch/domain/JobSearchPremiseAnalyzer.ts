import type { JobSearchFilter } from "./JobSearchFilter";
import type { JobSearchPremise } from "./JobSearchPremise";

export interface JobSearchPremiseAnalyzer {
	analyze(premise: JobSearchPremise): Promise<JobSearchFilter>;
}
