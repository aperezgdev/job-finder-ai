import type { JobSearch } from "./JobSearch";

export interface JobSearchRepository {
	save(jobSearch: JobSearch): Promise<void>;
	findById(jobSearchId: string): Promise<JobSearch | null>;
	searchAll(): Promise<Array<JobSearch>>;
	deleteById(jobSearchId: string): Promise<void>;
	deleteAll(): Promise<void>;
}
