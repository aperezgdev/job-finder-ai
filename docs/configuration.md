# Configuration

**English** | [Español](#español)

## Environment variables

The app validates configuration using Zod in `src/apps/telegram-bot/config.ts`.

### Required

- `OPENAI_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_IDS` (CSV list of authorized chat/group ids)

When multiple chats are authorized, each chat works as an isolated tenant (own profile, searches, scored jobs, and notifications).

### Optional with defaults

- `DATABASE_PATH` (default: `./data/jobs.sqlite`)
- `LOG_LEVEL` (default: `info`)
- `LINKEDIN_LOCATION` (default: `España`)
- `LINKEDIN_GEO_ID` (default: `105646813`)
- `REDIS_HOST` (default: `127.0.0.1`)
- `REDIS_PORT` (default: `6379`)
- `REDIS_DB` (default: `0`)
- `OPENAI_MODEL` (default: `gpt-4o-mini`)
- `OPENAI_TIMEOUT_MS` (default: `30000`)
- `WORKER_MAX_ATTEMPTS` (default: `3`)
- `WORKER_RETRY_BACKOFF_MS` (default: `5000`)
- `LANGUAGE` (code default: `en`)

> Note: `.env-example` sets `LANGUAGE=es`, while the code default is `en`.

## Recommended template

```env
NODE_ENV=production
LOG_LEVEL=info

DATABASE_PATH=/app/data/jobs.db

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_IDS=

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_TIMEOUT_MS=30000

LINKEDIN_LOCATION=España
LINKEDIN_GEO_ID=105646813
LANGUAGE=es

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0

WORKER_MAX_ATTEMPTS=3
WORKER_RETRY_BACKOFF_MS=5000
```

## Runtime modes

### Docker Compose

`docker-compose.yml` defines:

- `app`: project build, reads `.env`, persists DB in a volume.
- `redis`: Redis 7 with AOF and healthcheck.

Inside container, the app overrides:

- `DATABASE_PATH=/app/data/jobs.sqlite`
- `REDIS_HOST=redis`
- `REDIS_PORT=6379`
- `REDIS_DB=0`

### Local

If running without Docker:

1. start local Redis,
2. set a local `DATABASE_PATH`,
3. build (`pnpm build`) and start (`pnpm start`).

---

# Español

## Variables de entorno

La app valida configuración con Zod en `src/apps/telegram-bot/config.ts`.

### Requeridas

- `OPENAI_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_IDS` (lista CSV con ids de chats/grupos autorizados)

Si autorizas varios chats, cada uno funciona como tenant aislado (perfil, búsquedas, ofertas puntuadas y notificaciones propios).

### Opcionales con valor por defecto

- `DATABASE_PATH` (default: `./data/jobs.sqlite`)
- `LOG_LEVEL` (default: `info`)
- `LINKEDIN_LOCATION` (default: `España`)
- `LINKEDIN_GEO_ID` (default: `105646813`)
- `REDIS_HOST` (default: `127.0.0.1`)
- `REDIS_PORT` (default: `6379`)
- `REDIS_DB` (default: `0`)
- `OPENAI_MODEL` (default: `gpt-4o-mini`)
- `OPENAI_TIMEOUT_MS` (default: `30000`)
- `WORKER_MAX_ATTEMPTS` (default: `3`)
- `WORKER_RETRY_BACKOFF_MS` (default: `5000`)
- `LANGUAGE` (default en código: `en`)

> Nota: `.env-example` trae `LANGUAGE=es`, mientras que el default en código es `en`.

## Plantilla recomendada

```env
NODE_ENV=production
LOG_LEVEL=info

DATABASE_PATH=/app/data/jobs.db

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_IDS=

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_TIMEOUT_MS=30000

LINKEDIN_LOCATION=España
LINKEDIN_GEO_ID=105646813
LANGUAGE=es

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0

WORKER_MAX_ATTEMPTS=3
WORKER_RETRY_BACKOFF_MS=5000
```

## Modos de ejecución

### Docker Compose

`docker-compose.yml` define:

- `app`: build del proyecto, usa `.env`, persiste DB en volumen.
- `redis`: Redis 7 con AOF y healthcheck.

En contenedor la app fuerza:

- `DATABASE_PATH=/app/data/jobs.sqlite`
- `REDIS_HOST=redis`
- `REDIS_PORT=6379`
- `REDIS_DB=0`

### Local

Si ejecutas sin Docker:

1. levanta Redis local,
2. usa un `DATABASE_PATH` local,
3. compila (`pnpm build`) y arranca (`pnpm start`).
