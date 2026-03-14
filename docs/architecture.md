# Architecture

**English** | [Español](#español)

## Overview

`job-finder` is organized into domain contexts using a hexagonal style plus in-memory events:

- `JobSearch`: creation and management of scheduled searches.
- `JobOffer`: job offer scraping (LinkedIn) and persistence.
- `JobScored`: AI evaluation and score persistence.
- `JobOfferNotification`: notification delivery (Telegram).
- `UserProfile`: candidate profile (experience, priorities, target roles/mode/location, skills, salary floor).
- `Shared`: value objects, logging, event bus, and cross-cutting utilities.

The active app in this repository is `src/apps/telegram-bot`.

## Technical components

- Runtime: Node.js + TypeScript.
- DI: Awilix (`createTelegramBotContainer`).
- Persistence: SQLite + TypeORM (`synchronize: true`).
- Queue/scheduler: BullMQ over Redis.
- Scraping: Playwright + Chromium.
- AI: OpenAI API (premise analysis and scoring).
- Notification: `node-telegram-bot-api`.

## Functional flow

1. User executes `/createSearch ...` in Telegram.
2. The premise is analyzed with AI to generate a scraping `filter`.
3. `JobSearchPremiseAnalyzed` is published and the search is created.
4. A BullMQ scheduler is upserted by `jobSearchId`.
5. Worker runs periodic scraping (`JobOffersGetLatest`).
6. Each new offer triggers AI rating enriched with an optional structured candidate profile snapshot.
7. If score threshold passes, a Telegram notification is sent to configured `TELEGRAM_CHAT_ID`.
8. A scrape summary notification is also sent per execution.

Detailed diagram: `docs/event-flow.md`.

## Scheduling

`BullMQJobSearchScheduler` maps periodicity to intervals:

- `daily` → every 24h
- `weekly` → every 7 days
- `biweekly` → every 14 days
- `monthly` → every 30 days

Additional mapping to scraper date filter:

- `daily` → `24h`
- `weekly` → `week`
- `biweekly` → `month`
- `monthly` → `month`

## Dead-letter queue

When a job exhausts retries, the worker routes it to:

- Queue: `job-search-scrape-dead-letter`
- Job name: `job-search-scrape.dead-letter`

The `/dlq` command allows inspecting failed entries.

## Known limitations (from current code)

- Implemented scraping provider: LinkedIn only.
- Event bus is in-memory (no external broker across processes).
- TypeORM runs with `synchronize: true` (no versioned migrations).
- `help` says `/dlq` has default and max limits, but that validation is not explicitly enforced by the command implementation.
- Profile commands use positional/csv parsing (no conversational wizard).
- Deployment model is single-tenant self-hosted (one instance per user/chat).

---

# Español

## Resumen

`job-finder` está organizado por contextos de dominio con estilo hexagonal + eventos en memoria:

- `JobSearch`: creación y gestión de búsquedas programadas.
- `JobOffer`: scraping de ofertas (LinkedIn) y creación de ofertas en base de datos.
- `JobScored`: evaluación de ofertas con IA y persistencia del score.
- `JobOfferNotification`: envío de notificaciones (Telegram).
- `UserProfile`: perfil de candidato (experiencia, prioridades, roles/modalidad/ubicación objetivo, skills, salario mínimo).
- `Shared`: value objects, logging, event bus y utilidades transversales.

La app activa en este repositorio es `src/apps/telegram-bot`.

## Componentes técnicos

- Runtime: Node.js + TypeScript.
- DI: Awilix (`createTelegramBotContainer`).
- Persistencia: SQLite + TypeORM (`synchronize: true`).
- Cola/scheduler: BullMQ sobre Redis.
- Scraping: Playwright + Chromium.
- IA: OpenAI API (análisis de premisa y scoring).
- Notificación: `node-telegram-bot-api`.

## Flujo funcional

1. Usuario ejecuta `/createSearch ...` en Telegram.
2. Se analiza la premisa con IA para generar un `filter` de scraping.
3. Se publica `JobSearchPremiseAnalyzed` y se crea la búsqueda.
4. Se programa un scheduler BullMQ por `jobSearchId`.
5. Worker ejecuta scraping periódico (`JobOffersGetLatest`).
6. Cada oferta nueva dispara rating IA enriquecido con un snapshot estructurado del perfil (si existe).
7. Si cumple el umbral de score, se envía notificación por Telegram al `TELEGRAM_CHAT_ID` configurado.
8. También se envía resumen de scraping por ejecución.

Diagrama detallado: `docs/event-flow.md`.

## Scheduling

`BullMQJobSearchScheduler` mapea periodicidad a intervalo:

- `daily` → cada 24h
- `weekly` → cada 7 días
- `biweekly` → cada 14 días
- `monthly` → cada 30 días

Mapeo adicional a filtro de fecha del scraper:

- `daily` → `24h`
- `weekly` → `week`
- `biweekly` → `month`
- `monthly` → `month`

## Dead-letter queue

Cuando un trabajo agota reintentos, el worker lo envía a:

- Queue: `job-search-scrape-dead-letter`
- Job name: `job-search-scrape.dead-letter`

El comando `/dlq` permite inspeccionar entradas fallidas.

## Limitaciones conocidas (derivadas del código actual)

- Proveedor de scraping implementado: solo LinkedIn.
- Event bus es en memoria (no hay broker externo entre procesos).
- TypeORM está con `synchronize: true` (sin migraciones versionadas).
- El `help` indica default y máximo en `/dlq`, pero esa validación no está implementada todavía en el comando.
- Los comandos de perfil usan sintaxis posicional/csv (sin wizard conversacional).
- El modelo de despliegue es single-tenant self-hosted (una instancia por usuario/chat).
