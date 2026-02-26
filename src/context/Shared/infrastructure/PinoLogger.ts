import pino, { type Logger as PinoInstance } from "pino";
import type { Logger } from "../domain/Logger";

export class PinoLogger implements Logger {
	private readonly pinoLogger: PinoInstance;

	constructor(level: string = "info") {
		this.pinoLogger = pino({ level });
	}

	info(message: string, ...data: unknown[]): void {
		this.log("info", message, data);
	}

	warn(message: string, ...data: unknown[]): void {
		this.log("warn", message, data);
	}

	error(message: string, ...data: unknown[]): void {
		this.log("error", message, data);
	}

	private log(
		level: "info" | "warn" | "error",
		message: string,
		data: unknown[],
	): void {
		if (data.length === 0) {
			this.pinoLogger[level](message);
			return;
		}

		this.pinoLogger[level]({ data }, message);
	}
}
