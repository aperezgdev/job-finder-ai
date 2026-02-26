# Event Flow

This document shows the event flow between use cases, events, the event bus, and persistence.

```mermaid
flowchart TD
	C[JobSearchPremiseAnalyze] -->|JobSearchPremiseAnalyzed| S[JobSearchCreatorOnPremiseAnalyzed]
	S --> JC[JobSearchCreator]
	JC -->|Save| JR[(JobSearchRepository)]
	JR --> DB[(Database)]
	JC -->|JobSearchCreated| SCH[JobSearchSchedulerOnCreated]
	SCH --> EXE[JobSearchExecution Worker]
	EXE --> JGL[JobOffersGetLatest]
	JGL -->|JobOfferScrapped| JOC[JobOfferCreator]
	JOC -->|Save| JOR[(JobOfferRepository)]
	JOR --> DB
	JOC -->|JobOfferCreated| JSR[RateJobScoredOnOfferCreated]
	JSR --> JSRUC[JobScoredRater]
	JSRUC -->|JobScoredRated| JSC[CreateJobScoredOnRated]
	JSC --> JSCUC[JobScoredCreator]
	JSCUC -->|Save| JSCR[(JobScoredRepository)]
	JSCR --> DB
	JSCUC -->|JobScoredCreated| JON[NotifyJobOfferOnScoredCreated]
	JON --> JONUC[JobOfferNotificationSender]
	JGL -->|JobOffersScrapeSummaryReady| NSR[NotifyScrapeSummaryOnReady]
	NSR --> JONUC
	JONUC -->|Send / SendScrapeSummary| JONI[JobOfferNotifier]
	JONI --> END[End]
```

Notes:
- `JobSearchSchedulerOnCreated` now upserts schedulers in BullMQ (`job-search-scrape` queue) using `upsertJobScheduler(jobSearchId, ...)`.
- Job payload: `{ jobSearchId, premise, filter, datePostedPeriod, minNotificationRating }`.
- Periodicity mapping: `daily` (24h), `weekly` (7d), `biweekly` (14d), `monthly` (30d).
- Unschedule operation uses `removeJobScheduler(jobSearchId)`.
- `JobOffersGetLatest` publishes `JobOfferScrapped[]` and one `JobOffersScrapeSummaryReady` event per execution.
- `NotifyScrapeSummaryOnReady` computes how many scraped links reached `minNotificationRating` and sends a summary notification.
