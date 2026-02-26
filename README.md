# Job Finder

**English** | [Español](#español)

Self-hosted system to discover LinkedIn job offers, score them with AI, and notify the most relevant opportunities via Telegram.

## Features

- AI-powered scoring of scraped offers.
- Automated LinkedIn scraping through scheduled jobs.
- Telegram notifications for relevant opportunities.
- Search lifecycle management from Telegram commands.
- Dead-letter queue visibility for failed jobs (`/dlq`).
- Self-hosted stack with SQLite + Redis.

## Current status

- Main app: Telegram bot (`src/apps/telegram-bot`).
- Persistence: SQLite with TypeORM.
- Scheduling and queues: BullMQ + Redis.
- Scraping: Playwright over LinkedIn.
- Build and tests verified in this repo (`pnpm build` and `pnpm test` pass).

## Quick start

### Requirements

- Node.js 18+
- pnpm
- Docker and Docker Compose (recommended for full runtime)

### 1) Install dependencies

```bash
pnpm install
```

### 2) Configure environment

```bash
cp .env-example .env
```

Edit `.env` and define at least:

- `OPENAI_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

### 3) Run

With Docker (recommended):

```bash
docker compose up --build
```

Local (if Redis is already running):

```bash
pnpm build
pnpm start
```

## How to use

1. Open your Telegram bot chat.
2. Run `/help` to list all available commands.
3. Create a search with:

```text
/createSearch senior backend engineer weekly 09:30 4.5
```

4. Check active searches with `/searches`.
5. Review scored jobs with `/scored` or `/scoredSearch {jobSearchId}`.
6. Remove searches with `/deleteSearch {jobSearchId}` or `/deleteSearchAll`.

## Documentation

- Architecture: `docs/architecture.md`
- Environment configuration: `docs/configuration.md`
- Telegram commands: `docs/telegram-commands.md`
- Operations and troubleshooting: `docs/operations.md`
- Event flow diagram: `docs/event-flow.md`

## Development scripts

- `pnpm build`: compile TypeScript into `dist/`
- `pnpm start`: run `dist/apps/telegram-bot/index.js`
- `pnpm test`: run Jest tests
- `pnpm biome:fix`: format code
- `pnpm biome:check`: lint/quality checks
- `pnpm format:lint`: format + check

## License

ISC (`LICENSE`).

---

# Español

Sistema self-hosted para descubrir ofertas de empleo en LinkedIn, evaluarlas con IA y notificar por Telegram las más relevantes.

## Características

- Puntuación de ofertas con IA.
- Scraping automatizado de LinkedIn mediante jobs programados.
- Notificaciones por Telegram para oportunidades relevantes.
- Gestión del ciclo de vida de búsquedas con comandos de Telegram.
- Visibilidad de trabajos fallidos mediante dead-letter queue (`/dlq`).
- Stack self-hosted con SQLite + Redis.

## Estado actual

- App principal: bot de Telegram (`src/apps/telegram-bot`).
- Persistencia: SQLite con TypeORM.
- Scheduling y colas: BullMQ + Redis.
- Scraping: Playwright sobre LinkedIn.
- Build y tests verificados en este repo (`pnpm build` y `pnpm test` pasan).

## Inicio rápido

### Requisitos

- Node.js 18+
- pnpm
- Docker y Docker Compose (recomendado para ejecución completa)

### 1) Instalar dependencias

```bash
pnpm install
```

### 2) Configurar entorno

```bash
cp .env-example .env
```

Edita `.env` y define al menos:

- `OPENAI_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

### 3) Ejecutar

Con Docker (recomendado):

```bash
docker compose up --build
```

Local (si ya tienes Redis activo):

```bash
pnpm build
pnpm start
```

## Cómo usarlo

1. Abre el chat de tu bot en Telegram.
2. Ejecuta `/help` para ver todos los comandos disponibles.
3. Crea una búsqueda con:

```text
/createSearch senior backend engineer weekly 09:30 4.5
```

4. Consulta búsquedas activas con `/searches`.
5. Revisa ofertas puntuadas con `/scored` o `/scoredSearch {jobSearchId}`.
6. Elimina búsquedas con `/deleteSearch {jobSearchId}` o `/deleteSearchAll`.

## Documentación

- Arquitectura: `docs/architecture.md`
- Configuración de entorno: `docs/configuration.md`
- Comandos de Telegram: `docs/telegram-commands.md`
- Operación y troubleshooting: `docs/operations.md`
- Flujo de eventos (diagrama): `docs/event-flow.md`

## Scripts de desarrollo

- `pnpm build`: compila TypeScript a `dist/`
- `pnpm start`: arranca `dist/apps/telegram-bot/index.js`
- `pnpm test`: ejecuta tests Jest
- `pnpm biome:fix`: formatea
- `pnpm biome:check`: lint/quality checks
- `pnpm format:lint`: format + check

## Licencia

ISC (`LICENSE`).