import type { ConnectionOptions } from "bullmq";
import { z } from "zod";

export type AppConfig = {
	databasePath: string;
	logLevel: string;
	linkedIn: {
		location: string;
		geoId: string;
	};
	redis: {
		host: string;
		port: number;
		db: number;
	};
	redisConnection: ConnectionOptions;
	openAi: {
		apiKey: string;
		model: string;
		timeoutMs: number;
	};
	worker: {
		maxAttempts: number;
		retryBackoffMs: number;
	};
	telegram: {
		token: string;
		chatId: string;
	};
	language: string;
};

const envSchema = z.object({
	DATABASE_PATH: z.string().trim().min(1).default("./data/jobs.sqlite"),
	LOG_LEVEL: z.string().trim().min(1).default("info"),
	LINKEDIN_LOCATION: z.string().trim().min(1).default("España"),
	LINKEDIN_GEO_ID: z.string().trim().min(1).default("105646813"),
	REDIS_HOST: z.string().trim().min(1).default("127.0.0.1"),
	REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),
	REDIS_DB: z.coerce.number().int().min(0).default(0),
	OPENAI_API_KEY: z.string().trim().min(1, "OPENAI_API_KEY is required"),
	OPENAI_MODEL: z.string().trim().min(1).default("gpt-4o-mini"),
	OPENAI_TIMEOUT_MS: z.coerce.number().int().min(1).default(30_000),
	WORKER_MAX_ATTEMPTS: z.coerce.number().int().min(1).default(3),
	WORKER_RETRY_BACKOFF_MS: z.coerce.number().int().min(100).default(5_000),
	TELEGRAM_BOT_TOKEN: z
		.string()
		.trim()
		.min(1, "TELEGRAM_BOT_TOKEN is required"),
	TELEGRAM_CHAT_ID: z.string().trim().min(1, "TELEGRAM_CHAT_ID is required"),
	LANGUAGE: z.string().trim().min(1).default("en"),
});

function buildConfigError(error: z.ZodError): Error {
	const details = error.issues
		.map((issue) => {
			const key = issue.path.join(".") || "(root)";
			return `- ${key}: ${issue.message}`;
		})
		.join("\n");

	return new Error(`Invalid environment configuration:\n${details}`);
}

export function getAppConfig(): AppConfig {
	const parsed = envSchema.safeParse(process.env);
	if (!parsed.success) {
		throw buildConfigError(parsed.error);
	}

	const env = parsed.data;

	const redisConnection: ConnectionOptions = {
		host: env.REDIS_HOST,
		port: env.REDIS_PORT,
		db: env.REDIS_DB,
	};

	return {
		databasePath: env.DATABASE_PATH,
		logLevel: env.LOG_LEVEL,
		linkedIn: {
			location: env.LINKEDIN_LOCATION,
			geoId: env.LINKEDIN_GEO_ID,
		},
		redis: {
			host: env.REDIS_HOST,
			port: env.REDIS_PORT,
			db: env.REDIS_DB,
		},
		redisConnection,
		openAi: {
			apiKey: env.OPENAI_API_KEY,
			model: env.OPENAI_MODEL,
			timeoutMs: env.OPENAI_TIMEOUT_MS,
		},
		worker: {
			maxAttempts: env.WORKER_MAX_ATTEMPTS,
			retryBackoffMs: env.WORKER_RETRY_BACKOFF_MS,
		},
		telegram: {
			token: env.TELEGRAM_BOT_TOKEN,
			chatId: env.TELEGRAM_CHAT_ID,
		},
		language: env.LANGUAGE,
	};
}
