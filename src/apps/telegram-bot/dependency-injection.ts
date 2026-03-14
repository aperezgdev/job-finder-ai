import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import {
	type AwilixContainer,
	asClass,
	asFunction,
	asValue,
	createContainer,
	InjectionMode,
} from "awilix";
import type { Queue, Worker } from "bullmq";
import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";
import { DataSource } from "typeorm";
import { OnJobOffersScrapedCreator } from "../../context/JobOffer/application/CreateJobOfferOnScrapped";
import { JobOfferCreator } from "../../context/JobOffer/application/JobOfferCreator";
import { JobOffersGetLatest } from "../../context/JobOffer/application/JobOffersGetLatest";
import { JobOfferEntity } from "../../context/JobOffer/infrastructure/JobOfferEntity";
import { LinkedInJobOfferScrapper } from "../../context/JobOffer/infrastructure/LinkedInJobOfferScrapper";
import { SQLiteJobOfferRepository } from "../../context/JobOffer/infrastructure/SQLiteJobOfferRepository";
import { JobOfferNotificationSender } from "../../context/JobOfferNotification/application/JobOfferNotificationSender";
import { JobOfferScrapeSummaryNotificationSender } from "../../context/JobOfferNotification/application/JobOfferScrapeSummaryNotificationSender";
import { NotifyJobOfferOnScoredCreated } from "../../context/JobOfferNotification/application/NotifyJobOfferOnScoredCreated";
import { NotifyScrapeSummaryOnReady } from "../../context/JobOfferNotification/application/NotifyScrapeSummaryOnReady";
import type { JobOfferNotifier } from "../../context/JobOfferNotification/domain/JobOfferNotifier";
import { JobOfferTelegramBotNotification } from "../../context/JobOfferNotification/infrastructure/JobOfferTelegramBotNotification";
import { CreateJobScoredOnRated } from "../../context/JobScored/application/CreateJobScoredOnRated";
import { JobScoredCreator } from "../../context/JobScored/application/JobScoredCreator";
import { JobScoredFinderAll } from "../../context/JobScored/application/JobScoredFinderAll";
import { JobScoredFinderBySearch } from "../../context/JobScored/application/JobScoredFinderBySearch";
import { JobScoredRater } from "../../context/JobScored/application/JobScoredRater";
import { RateJobScoredOnOfferCreated } from "../../context/JobScored/application/RateJobScoredOnOfferCreated";
import { JobScoredEntity } from "../../context/JobScored/infrastructure/JobScoredEntity";
import { OpenAIJobScoredRaterAI } from "../../context/JobScored/infrastructure/OpenAIJobScoredRaterAI";
import { SQLiteJobScoredRepository } from "../../context/JobScored/infrastructure/SQLiteJobScoredRepository";
import { JobSearchCreator } from "../../context/JobSearch/application/JobSearchCreator";
import { JobSearchCreatorOnPremiseAnalyzed } from "../../context/JobSearch/application/JobSearchCreatorOnPremiseAnalyzed";
import { JobSearchDelete } from "../../context/JobSearch/application/JobSearchDelete";
import { JobSearchDeleteAll } from "../../context/JobSearch/application/JobSearchDeleteAll";
import { JobSearchFinderAll } from "../../context/JobSearch/application/JobSearchFinderAll";
import { JobSearchPremiseAnalyze } from "../../context/JobSearch/application/JobSearchPremiseAnalyze";
import { JobSearchSchedulerOnCreated } from "../../context/JobSearch/application/JobSearchSchedulerOnCreated";
import { JobSearchUnscheduler } from "../../context/JobSearch/application/JobSearchUnscheduler";
import { JobSearchUnschedulerOnDeleted } from "../../context/JobSearch/application/JobSearchUnschedulerOnDeleted";
import { BullMQJobSearchScheduler } from "../../context/JobSearch/infrastructure/BullMQJobSearchScheduler";
import { JobSearchEntity } from "../../context/JobSearch/infrastructure/JobSearchEntity";
import { OpenAIJobSearchPremiseAnalyzer } from "../../context/JobSearch/infrastructure/OpenAIJobSearchPremiseAnalyzer";
import { SQLiteJobSearchRepository } from "../../context/JobSearch/infrastructure/SQLiteJobSearchRepository";
import type { Event } from "../../context/Shared/domain/event/Event";
import type { EventSubscriber } from "../../context/Shared/domain/event/EventSubscriber";
import type { Logger } from "../../context/Shared/domain/Logger";
import { InMemoryEventBus } from "../../context/Shared/infrastructure/InMemoryEventBus";
import { PinoLogger } from "../../context/Shared/infrastructure/PinoLogger";
import { UserProfileDelete } from "../../context/UserProfile/application/UserProfileDelete";
import { UserProfileFinder } from "../../context/UserProfile/application/UserProfileFinder";
import { UserProfileUpsert } from "../../context/UserProfile/application/UserProfileUpsert";
import { SQLiteUserProfileRepository } from "../../context/UserProfile/infrastructure/SQLiteUserProfileRepository";
import { UserProfileEntity } from "../../context/UserProfile/infrastructure/UserProfileEntity";
import type { AppConfig } from "./config";
import {
	createJobSearchScrapeDeadLetterQueue,
	createJobSearchScrapeWorker,
	type JobSearchScrapeDeadLetterPayload,
	type JobSearchScrapePayload,
} from "./workers";

export type TelegramBotContainer = {
	config: AppConfig;
	logger: Logger;
	eventBus: InMemoryEventBus;
	dataSource: DataSource;
	creator: JobOfferCreator;
	jobOfferRepository: SQLiteJobOfferRepository;
	jobSearchRepository: SQLiteJobSearchRepository;
	jobScoredRepository: SQLiteJobScoredRepository;
	userProfileRepository: SQLiteUserProfileRepository;
	scheduler: BullMQJobSearchScheduler;
	jobOfferScrapper: LinkedInJobOfferScrapper;
	jobOffersGetLatest: JobOffersGetLatest;
	jobOfferCreator: JobOfferCreator;
	onJobOffersScrapped: OnJobOffersScrapedCreator;
	jobSearchCreator: JobSearchCreator;
	analyzer: OpenAIJobSearchPremiseAnalyzer;
	jobSearchPremiseAnalyzer: OpenAIJobSearchPremiseAnalyzer;
	jobSearchPremiseAnalyze: JobSearchPremiseAnalyze;
	jobSearchFinderAll: JobSearchFinderAll;
	jobSearchUnscheduler: JobSearchUnscheduler;
	jobSearchDelete: JobSearchDelete;
	jobSearchDeleteAll: JobSearchDeleteAll;
	jobSearchCreatorOnPremiseAnalyzed: JobSearchCreatorOnPremiseAnalyzed;
	jobSearchSchedulerOnCreated: JobSearchSchedulerOnCreated;
	jobSearchUnschedulerOnDeleted: JobSearchUnschedulerOnDeleted;
	openAiClient: OpenAI;
	raterAI: OpenAIJobScoredRaterAI;
	jobScoredRaterAI: OpenAIJobScoredRaterAI;
	jobScoredRater: JobScoredRater;
	jobScoredCreator: JobScoredCreator;
	jobScoredFinderAll: JobScoredFinderAll;
	jobScoredFinderBySearch: JobScoredFinderBySearch;
	userProfileUpsert: UserProfileUpsert;
	userProfileFinder: UserProfileFinder;
	userProfileDelete: UserProfileDelete;
	rateJobScoredOnOfferCreated: RateJobScoredOnOfferCreated;
	createJobScoredOnRated: CreateJobScoredOnRated;
	telegramBot: TelegramBot;
	notifier: JobOfferNotifier;
	jobOfferNotifier: JobOfferNotifier;
	sender: JobOfferNotificationSender;
	jobOfferNotificationSender: JobOfferNotificationSender;
	jobOfferScrapeSummaryNotificationSender: JobOfferScrapeSummaryNotificationSender;
	notifyJobOfferOnScoredCreated: NotifyJobOfferOnScoredCreated;
	notifyScrapeSummaryOnReady: NotifyScrapeSummaryOnReady;
	subscribers: Array<EventSubscriber<Event>>;
	deadLetterQueue: Queue<JobSearchScrapeDeadLetterPayload>;
	worker: Worker<JobSearchScrapePayload>;
};

export const initContainer = (
	container: AwilixContainer<TelegramBotContainer>,
): void => {
	container.register({
		logger: asFunction((config) => new PinoLogger(config.logLevel)).singleton(),
		jobOfferRepository: asClass(SQLiteJobOfferRepository).singleton(),
		jobSearchRepository: asClass(SQLiteJobSearchRepository).singleton(),
		jobScoredRepository: asClass(SQLiteJobScoredRepository).singleton(),
		userProfileRepository: asClass(SQLiteUserProfileRepository).singleton(),
		scheduler: asFunction(
			(config) =>
				new BullMQJobSearchScheduler({
					connection: config.redisConnection,
					maxAttempts: config.worker.maxAttempts,
					retryBackoffMs: config.worker.retryBackoffMs,
				}),
		).singleton(),
		jobOfferScrapper: asFunction(
			(config) =>
				new LinkedInJobOfferScrapper({
					location: config.linkedIn.location,
					geoId: config.linkedIn.geoId,
				}),
		).singleton(),
		jobOffersGetLatest: asClass(JobOffersGetLatest).singleton(),

		jobOfferCreator: asClass(JobOfferCreator).scoped(),
		creator: asFunction((jobOfferCreator) => jobOfferCreator).scoped(),
		onJobOffersScrapped: asClass(OnJobOffersScrapedCreator).scoped(),

		jobSearchCreator: asClass(JobSearchCreator).scoped(),
		jobSearchPremiseAnalyzer: asFunction((openAiClient, config) => {
			return new OpenAIJobSearchPremiseAnalyzer(
				openAiClient,
				config.openAi.model,
				config.language,
			);
		}).scoped(),
		analyzer: asFunction(
			(jobSearchPremiseAnalyzer) => jobSearchPremiseAnalyzer,
		).scoped(),
		jobSearchPremiseAnalyze: asClass(JobSearchPremiseAnalyze).scoped(),
		jobSearchFinderAll: asClass(JobSearchFinderAll).scoped(),
		jobSearchUnscheduler: asClass(JobSearchUnscheduler).scoped(),
		jobSearchDelete: asClass(JobSearchDelete).scoped(),
		jobSearchDeleteAll: asClass(JobSearchDeleteAll).scoped(),
		jobSearchCreatorOnPremiseAnalyzed: asClass(
			JobSearchCreatorOnPremiseAnalyzed,
		).scoped(),
		jobSearchSchedulerOnCreated: asClass(JobSearchSchedulerOnCreated).scoped(),
		jobSearchUnschedulerOnDeleted: asClass(
			JobSearchUnschedulerOnDeleted,
		).scoped(),

		openAiClient: asFunction((config) => {
			return new OpenAI({
				apiKey: config.openAi.apiKey,
				timeout: config.openAi.timeoutMs,
			});
		}).singleton(),
		jobScoredRaterAI: asFunction((openAiClient, config) => {
			return new OpenAIJobScoredRaterAI(
				openAiClient,
				config.openAi.model,
				config.language,
			);
		}).scoped(),
		raterAI: asFunction((jobScoredRaterAI) => jobScoredRaterAI).scoped(),
		jobScoredRater: asClass(JobScoredRater).scoped(),
		jobScoredCreator: asClass(JobScoredCreator).scoped(),
		jobScoredFinderAll: asClass(JobScoredFinderAll).scoped(),
		jobScoredFinderBySearch: asClass(JobScoredFinderBySearch).scoped(),
		userProfileUpsert: asClass(UserProfileUpsert).scoped(),
		userProfileFinder: asClass(UserProfileFinder).scoped(),
		userProfileDelete: asClass(UserProfileDelete).scoped(),
		rateJobScoredOnOfferCreated: asClass(RateJobScoredOnOfferCreated).scoped(),
		createJobScoredOnRated: asClass(CreateJobScoredOnRated).scoped(),

		telegramBot: asFunction((config) => {
			return new TelegramBot(config.telegram.token, { polling: true });
		}).singleton(),
		jobOfferNotifier: asFunction((telegramBot) => {
			return new JobOfferTelegramBotNotification(telegramBot);
		}).scoped(),
		notifier: asFunction((jobOfferNotifier) => jobOfferNotifier).scoped(),
		jobOfferNotificationSender: asClass(JobOfferNotificationSender).scoped(),
		jobOfferScrapeSummaryNotificationSender: asClass(
			JobOfferScrapeSummaryNotificationSender,
		).scoped(),
		sender: asFunction(
			(jobOfferNotificationSender) => jobOfferNotificationSender,
		).scoped(),
		notifyJobOfferOnScoredCreated: asClass(
			NotifyJobOfferOnScoredCreated,
		).scoped(),
		notifyScrapeSummaryOnReady: asFunction(
			(jobOfferScrapeSummaryNotificationSender) =>
				new NotifyScrapeSummaryOnReady(jobOfferScrapeSummaryNotificationSender),
		).scoped(),

		subscribers: asFunction(
			(
				onJobOffersScrapped,
				jobSearchCreatorOnPremiseAnalyzed,
				jobSearchSchedulerOnCreated,
				jobSearchUnschedulerOnDeleted,
				rateJobScoredOnOfferCreated,
				createJobScoredOnRated,
				notifyJobOfferOnScoredCreated,
				notifyScrapeSummaryOnReady,
			) => {
				const subscribers: Array<EventSubscriber<Event>> = [
					onJobOffersScrapped,
					jobSearchCreatorOnPremiseAnalyzed as unknown as EventSubscriber<Event>,
					jobSearchSchedulerOnCreated as unknown as EventSubscriber<Event>,
					jobSearchUnschedulerOnDeleted as unknown as EventSubscriber<Event>,
					createJobScoredOnRated as unknown as EventSubscriber<Event>,
					rateJobScoredOnOfferCreated as unknown as EventSubscriber<Event>,
					notifyJobOfferOnScoredCreated as unknown as EventSubscriber<Event>,
					notifyScrapeSummaryOnReady as unknown as EventSubscriber<Event>,
				];

				return subscribers;
			},
		).singleton(),
		deadLetterQueue: asFunction((config) =>
			createJobSearchScrapeDeadLetterQueue({ config }),
		).singleton(),
		worker: asFunction((config, jobOffersGetLatest, logger, deadLetterQueue) =>
			createJobSearchScrapeWorker({
				config,
				jobOffersGetLatest,
				logger,
				deadLetterQueue,
			}),
		).singleton(),
	});
};

export async function createTelegramBotContainer(
	config: AppConfig,
): Promise<AwilixContainer<TelegramBotContainer>> {
	await mkdir(dirname(config.databasePath), { recursive: true });
	const dataSource = new DataSource({
		type: "sqlite",
		database: config.databasePath,
		synchronize: true,
		entities: [
			JobOfferEntity,
			JobSearchEntity,
			JobScoredEntity,
			UserProfileEntity,
		],
	});

	await dataSource.initialize();
	const container = createContainer<TelegramBotContainer>({
		injectionMode: InjectionMode.CLASSIC,
	});

	container.register({
		config: asValue(config),
		eventBus: asClass(InMemoryEventBus).singleton(),
		dataSource: asValue(dataSource),
	});

	initContainer(container);
	container.resolve("eventBus").addSuscriber(container.resolve("subscribers"));

	return container;
}
