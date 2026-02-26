# Operations and Troubleshooting

**English** | [Español](#español)

## Startup

### Docker

```bash
docker compose up --build
```

### Shutdown

```bash
docker compose down
```

## Development and quality

```bash
pnpm build
pnpm test
pnpm biome:fix
pnpm biome:check
```

Validated state in this repository:

- `pnpm build`: OK
- `pnpm test`: OK (34 suites, 75 tests)

## Logs

Pino (`PinoLogger`) is used with level controlled by `LOG_LEVEL`.

## Critical runtime dependencies

- Redis available and reachable.
- Valid OpenAI credentials.
- Telegram bot token and chat id configured correctly.
- Playwright Chromium available (already included in Docker image).

## Common issues

### Configuration error at startup

The app fails fast when required variables are missing (`OPENAI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`).

### Telegram messages are not delivered

Verify:

- correct bot token,
- correct `TELEGRAM_CHAT_ID`,
- bot can post to that chat.

### New offers are not appearing

Verify:

- connectivity to LinkedIn,
- search filters are not too restrictive,
- periodicity/UTC schedule are valid,
- worker failures in logs and `/dlq`.

### Failed jobs in queue

Inspect dead-letter entries with:

```text
/dlq 10
```

## Open questions (to avoid assumptions)

1. Should we document this repository as single-user (your Telegram chat) or multi-user?
2. Do you want `LANGUAGE=es` as the official recommendation, or keep `en` as the main default?
3. Should I document backup/restore strategy for SQLite and Redis in production?
4. Do you want a specific deployment guide (for example VPS + systemd or Docker Compose only)?

---

# Español

## Arranque

### Docker

```bash
docker compose up --build
```

### Parada

```bash
docker compose down
```

## Desarrollo y calidad

```bash
pnpm build
pnpm test
pnpm biome:fix
pnpm biome:check
```

Estado validado en este repositorio:

- `pnpm build`: OK
- `pnpm test`: OK (34 suites, 75 tests)

## Logs

Se usa Pino (`PinoLogger`) con nivel configurable por `LOG_LEVEL`.

## Dependencias críticas en runtime

- Redis disponible y accesible.
- Credenciales válidas de OpenAI.
- Bot de Telegram con token válido y chat id correcto.
- Chromium de Playwright disponible (imagen Docker ya lo incluye).

## Problemas frecuentes

### Error de configuración al arrancar

La app falla rápido si faltan variables obligatorias (`OPENAI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`).

### No llegan mensajes de Telegram

Verificar:

- token correcto,
- `TELEGRAM_CHAT_ID` correcto,
- el bot puede enviar mensajes a ese chat.

### No aparecen ofertas nuevas

Verificar:

- conectividad a LinkedIn,
- filtros de búsqueda muy restrictivos,
- periodicidad/hora UTC configuradas,
- logs de fallos en worker y `/dlq`.

### Trabajos fallidos en cola

Consultar dead-letter con:

```text
/dlq 10
```

## Preguntas abiertas (para no asumir)

1. ¿Documentamos este repositorio como servicio monousuario (tu chat de Telegram) o multiusuario?
2. ¿Quieres fijar `LANGUAGE=es` como recomendación oficial, o mantener `en` como default principal?
3. ¿Deseas que documente estrategia de respaldo/restauración de SQLite y Redis para producción?
4. ¿Quieres una guía de despliegue específica (por ejemplo VPS + systemd o solo Docker Compose)?
