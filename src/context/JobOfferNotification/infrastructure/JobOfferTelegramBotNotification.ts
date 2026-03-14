import type TelegramBot from "node-telegram-bot-api";
import type { JobScoredComment } from "../../JobScored/domain/JobScoredComment";
import type { JobScoredHighlights } from "../../JobScored/domain/JobScoredHighlights";
import type { JobScoredRating } from "../../JobScored/domain/JobScoredRating";
import type { JobCompany } from "../../Shared/domain/JobCompany";
import type { JobLink } from "../../Shared/domain/JobLink";
import type { JobLocation } from "../../Shared/domain/JobLocation";
import type { JobProvider } from "../../Shared/domain/JobProvider";
import type { JobSalary } from "../../Shared/domain/JobSalary";
import type { JobSummary } from "../../Shared/domain/JobSummary";
import type { JobTitle } from "../../Shared/domain/JobTitle";
import type { JobWorkMode } from "../../Shared/domain/JobWorkMode";

export class JobOfferTelegramBotNotification {
	constructor(private readonly telegramBot: TelegramBot) {}

	async send({
		chatId,
		title,
		summary,
		company,
		provider,
		link,
		rating,
		comment,
		highlights,
		location,
		workMode,
		salary,
	}: {
		chatId: string;
		title: JobTitle;
		summary: JobSummary;
		company: JobCompany;
		provider: JobProvider;
		link: JobLink;
		salary?: JobSalary;
		location?: JobLocation;
		workMode?: JobWorkMode;
		rating: JobScoredRating;
		comment: JobScoredComment;
		highlights: JobScoredHighlights;
	}): Promise<void> {
		await this.telegramBot.sendMessage(
			chatId,
			this.formatMessage({
				title,
				summary,
				company,
				provider,
				link,
				rating,
				comment,
				highlights,
				location,
				workMode,
				salary,
			}),
			{ parse_mode: "HTML" },
		);
	}

	async sendScrapeSummary({
		chatId,
		jobSearchId,
		premise,
		totalScraped,
	}: {
		chatId: string;
		jobSearchId: string;
		premise: string;
		totalScraped: number;
	}): Promise<void> {
		await this.telegramBot.sendMessage(
			chatId,
			this.formatScrapeSummaryMessage({
				jobSearchId,
				premise,
				totalScraped,
			}),
			{ parse_mode: "HTML" },
		);
	}

	private formatMessage({
		title,
		summary,
		company,
		provider,
		link,
		rating,
		comment,
		highlights,
		location,
		workMode,
		salary,
	}: {
		title: JobTitle;
		summary: JobSummary;
		company: JobCompany;
		provider: JobProvider;
		link: JobLink;
		salary?: JobSalary;
		location?: JobLocation;
		workMode?: JobWorkMode;
		rating: JobScoredRating;
		comment: JobScoredComment;
		highlights: JobScoredHighlights;
	}): string {
		const formattedHighlights =
			highlights.value.length > 0
				? highlights.value
						.map((highlight) => `• ${this.escapeHtml(highlight)}`)
						.join("\n")
				: "N/A";

		const lines = [
			`<b>💼 ${this.escapeHtml(title.value)}</b>`,
			`🏢 ${this.escapeHtml(company.value)}`,
			`🔎 ${this.escapeHtml(provider.value)}`,
			"",
			`📝 ${this.escapeHtml(summary.value)}`,
			"",
			`📍 <b>Location:</b> ${this.escapeHtml(location?.value ?? "N/A")}`,
			`🏠 <b>Work mode:</b> ${this.escapeHtml(workMode?.value ?? "N/A")}`,
			`💰 <b>Salary:</b> ${this.escapeHtml(salary?.value !== undefined ? String(salary.value) : "N/A")}`,
			`⭐ <b>Rating:</b> ${this.escapeHtml(String(rating.value))}/5`,
			"",
			`💬 <b>Comment:</b> ${this.escapeHtml(comment.value)}`,
			"",
			"✨ <b>Highlights:</b>",
			formattedHighlights,
			"",
			`🔗 <a href="${this.escapeHtml(link.value)}">Ver oferta</a>`,
		];

		return lines.join("\n");
	}

	private formatScrapeSummaryMessage({
		jobSearchId,
		premise,
		totalScraped,
	}: {
		jobSearchId: string;
		premise: string;
		totalScraped: number;
	}): string {
		const lines = [
			"<b>📊 Resumen de scraping</b>",
			`🆔 <b>Search:</b> ${this.escapeHtml(jobSearchId)}`,
			`🔎 <b>Filtro:</b> ${this.escapeHtml(premise)}`,
			`🧲 <b>Trabajos scrapeados:</b> ${this.escapeHtml(String(totalScraped))}`,
		];

		return lines.join("\n");
	}

	private escapeHtml(value: string): string {
		return value
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
	}
}
