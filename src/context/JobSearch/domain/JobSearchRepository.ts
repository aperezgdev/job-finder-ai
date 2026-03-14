import type { JobSearch } from "./JobSearch";

export interface JobSearchRepository {
	save(jobSearch: JobSearch): Promise<void>;
	findById(jobSearchId: string, chatId: string): Promise<JobSearch | null>;
	searchAllByChatId(chatId: string): Promise<Array<JobSearch>>;
	deleteById(jobSearchId: string, chatId: string): Promise<void>;
	deleteAllByChatId(chatId: string): Promise<void>;
}
