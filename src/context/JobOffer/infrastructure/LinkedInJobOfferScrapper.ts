import { chromium, type LaunchOptions } from "playwright";
import { JobCompany } from "../../Shared/domain/JobCompany";
import { JobLink } from "../../Shared/domain/JobLink";
import { JobLocation } from "../../Shared/domain/JobLocation";
import { JobMinNotificationRating } from "../../Shared/domain/JobMinNotificationRating";
import { JobPremise } from "../../Shared/domain/JobPremise";
import { JobProvider, JobProviderEnum } from "../../Shared/domain/JobProvider";
import { JobSalary } from "../../Shared/domain/JobSalary";
import type { JobSearchFilter } from "../../Shared/domain/JobSearchFilter";
import { JobSummary } from "../../Shared/domain/JobSummary";
import { JobTitle } from "../../Shared/domain/JobTitle";
import { JobWorkMode, JobWorkModeEnum } from "../../Shared/domain/JobWorkMode";
import { JobOffer } from "../domain/JobOffer";
import type { JobOfferDatePostedPeriod } from "../domain/JobOfferDatePostedPeriod";
import type { JobOfferScrapper } from "../domain/JobOfferScrapper";

type LinkedInDatePostedPeriod = "24h" | "week" | "month";

export class LinkedInJobOfferScrapper implements JobOfferScrapper {
	private static readonly DEFAULT_LOCATION = "España";
	private static readonly DEFAULT_GEO_ID = "105646813";
	private static readonly DEFAULT_MIN_NOTIFICATION_RATING = 3;
	private static readonly LINKEDIN_DATE_POSTED_BY_PERIOD: Record<
		LinkedInDatePostedPeriod,
		string
	> = {
		"24h": "r86400",
		week: "r604800",
		month: "r2592000",
	};

	private readonly searchBaseUrl: string;
	private readonly launchOptions?: LaunchOptions;
	private readonly location: string;
	private readonly geoId: string;

	constructor(params?: {
		searchBaseUrl?: string;
		launchOptions?: LaunchOptions;
		location?: string;
		geoId?: string;
	}) {
		this.searchBaseUrl =
			params?.searchBaseUrl ?? "https://www.linkedin.com/jobs/search";
		this.launchOptions = params?.launchOptions;
		this.location =
			params?.location ?? LinkedInJobOfferScrapper.DEFAULT_LOCATION;
		this.geoId = params?.geoId ?? LinkedInJobOfferScrapper.DEFAULT_GEO_ID;
	}

	async getLastJobOffers({
		searchFilter,
		datePostedPeriod,
	}: {
		searchFilter: JobSearchFilter;
		datePostedPeriod: JobOfferDatePostedPeriod;
	}): Promise<JobOffer[]> {
		const searchUrl = this.buildSearchUrl({
			keywords: searchFilter.value,
			datePosted: datePostedPeriod.value as LinkedInDatePostedPeriod,
		});
		const cards = await this.scrapeCards(searchUrl);

		const premise = searchFilter.value.trim();
		const seenLinks = new Set<string>();

		return cards
			.map((card) => {
				if (!card.link || !card.title || !card.company) {
					return null;
				}

				return {
					title: card.title,
					company: card.company,
					summary: card.summary,
					premise,
					link: this.toAbsoluteLinkedInUrl(card.link),
					location: card.location || undefined,
					workMode: this.detectWorkMode(card.fullText),
					salary: this.extractSalary(card.fullText),
				};
			})
			.filter((card): card is NonNullable<typeof card> => Boolean(card))
			.filter((card) => {
				if (seenLinks.has(card.link)) return false;
				seenLinks.add(card.link);
				return true;
			})
			.map((card) =>
				JobOffer.create({
					title: new JobTitle(card.title),
					company: new JobCompany(card.company),
					summary: new JobSummary(card.summary),
					premise: new JobPremise(card.premise),
					provider: new JobProvider(JobProviderEnum.LINKEDIN),
					link: new JobLink(card.link),
					minNotificationRating: new JobMinNotificationRating(
						LinkedInJobOfferScrapper.DEFAULT_MIN_NOTIFICATION_RATING,
					),
					workMode: new JobWorkMode(card.workMode),
					location: card.location ? new JobLocation(card.location) : undefined,
					salary: card.salary ? new JobSalary(card.salary) : undefined,
				}),
			);
	}

	private buildSearchUrl(searchFilter: {
		keywords: string;
		datePosted: LinkedInDatePostedPeriod;
	}): string {
		const keywords = searchFilter.keywords?.trim();
		if (!keywords) {
			throw new Error("LinkedIn query requires search text");
		}

		const url = new URL(this.searchBaseUrl);
		url.searchParams.set("keywords", keywords);
		url.searchParams.set("location", this.location);
		url.searchParams.set("geoId", this.geoId);
		url.searchParams.set(
			"f_TPR",
			LinkedInJobOfferScrapper.LINKEDIN_DATE_POSTED_BY_PERIOD[
				searchFilter.datePosted
			],
		);

		return url.toString();
	}

	private async scrapeCards(searchUrl: string): Promise<
		Array<{
			title: string;
			company: string;
			location: string;
			summary: string;
			fullText: string;
			link: string;
		}>
	> {
		const browser = await chromium.launch({
			headless: true,
			...this.launchOptions,
		});

		try {
			const context = await browser.newContext({
				locale: "es-ES",
				userAgent:
					"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
			});
			const page = await context.newPage();

			await page.goto(searchUrl, {
				waitUntil: "domcontentloaded",
				timeout: 45_000,
			});

			await page
				.waitForSelector("a.base-card__full-link", { timeout: 7_000 })
				.catch(() => undefined);

			const cards = await page.$$eval("a.base-card__full-link", (anchors) => {
				const normalizeText = (value: string | null | undefined): string => {
					if (!value) return "";
					return value.replace(/\s+/g, " ").trim();
				};

				const getText = (element: Element | null): string => {
					return normalizeText(element?.textContent);
				};

				return anchors.map((anchor) => {
					const card = anchor.closest("li, div");
					const title = getText(
						card?.querySelector(".base-search-card__title") ?? null,
					);
					const company = getText(
						card?.querySelector(".base-search-card__subtitle") ?? null,
					);
					const location = getText(
						card?.querySelector(".job-search-card__location") ?? null,
					);
					const summary =
						getText(
							card?.querySelector(".job-search-card__benefits") ?? null,
						) ||
						getText(
							card?.querySelector(".job-search-card__listdate") ?? null,
						) ||
						normalizeText(card?.textContent).slice(0, 280);
					const fullText = normalizeText(card?.textContent);
					const link = (anchor as HTMLAnchorElement).href || "";

					return {
						title,
						company,
						location,
						summary,
						fullText,
						link,
					};
				});
			});

			await context.close();
			return cards;
		} finally {
			await browser.close();
		}
	}

	private toAbsoluteLinkedInUrl(link: string): string {
		return new URL(link, "https://www.linkedin.com").toString();
	}

	private detectWorkMode(text: string): JobWorkModeEnum {
		const normalizedText = text.toLowerCase();

		if (/(remoto|remote)/.test(normalizedText)) {
			return JobWorkModeEnum.REMOTE;
		}

		if (/(h[íi]brido|hybrid)/.test(normalizedText)) {
			return JobWorkModeEnum.HYBRID;
		}

		if (/(presencial|onsite|on-site)/.test(normalizedText)) {
			return JobWorkModeEnum.ONSITE;
		}

		return JobWorkModeEnum.UNSPECIFIED;
	}

	private extractSalary(text: string): number | undefined {
		const salaryWithK = text.match(/(?:€|\$|£)\s*(\d+(?:[.,]\d+)?)\s*[kK]/);
		if (salaryWithK) {
			const normalized = Number(salaryWithK[1].replace(",", "."));
			if (!Number.isNaN(normalized)) {
				return Math.round(normalized * 1000);
			}
		}

		const salary = text.match(/(?:€|\$|£)\s*(\d{2,3}(?:[.,]\d{3})+)/);
		if (!salary) {
			return undefined;
		}

		const normalized = Number(salary[1].replace(/[.,]/g, ""));
		return Number.isNaN(normalized) ? undefined : normalized;
	}
}
