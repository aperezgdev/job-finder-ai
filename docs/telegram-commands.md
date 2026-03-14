# Telegram Commands

**English** | [Español](#español)

Command registration lives in `src/apps/telegram-bot/commands/index.ts`.

## Available commands

### `/help`

Shows help and command syntax.

### `/setProfile`

Creates or updates the instance candidate profile.

- The bot asks one question at a time.
- For list questions, answer with comma-separated values (`a,b,c`) or `none`.
- For minimum salary, answer with a number (`>= 0`) or `none`.

### `/cancel`

Cancels an active `/setProfile` flow.

### `/profile`

Shows the instance candidate profile.

### `/deleteProfile`

Deletes the instance candidate profile.

### `/createSearch {premise} {periodicity} {scheduledAtUtcHour} {minNotificationRating}`

Creates a scheduled job search.

Domain-validated rules:

- `periodicity`: `daily`, `weekly`, `biweekly`, `monthly`
- `scheduledAtUtcHour`: `HH:mm` (UTC) from `00:00` to `23:59`
- `minNotificationRating`: from `3` to `5`, in `0.5` steps

Example:

```text
/createSearch senior backend engineer weekly 09:30 4.5
```

### `/searches`

Lists scheduled searches:

- id
- premise
- periodicity
- UTC hour
- minimum notification rating

### `/scored`

Lists scored jobs across all searches.

### `/scoredSearch {jobSearchId}`

Lists scored jobs for one specific search.

### `/deleteSearch {jobSearchId}`

Deletes one search and unschedules its scheduler.

### `/deleteSearchAll`

Deletes all searches and unschedules all schedulers.

## Multi-tenant note

- Commands are processed only for authorized chats (`TELEGRAM_CHAT_IDS`).
- Each authorized chat/group is isolated (own profile, searches, scored jobs, and notifications).
- Non-authorized chats receive the private/self-hosted message.

### `/dlq [limit]`

Lists dead-letter jobs.

- Help message says: default `10`, max `30`.
- Current code does not explicitly enforce that default/max.

## Errors and responses

- Domain validation errors are returned to the user.
- Internal errors use command-specific generic messages.
- Unknown command: `Unknown command. Use /help to see available commands.`

## Parsing notes

The argument parser supports multi-word premises in the first argument (`premise`).

---

# Español

Registro de comandos en `src/apps/telegram-bot/commands/index.ts`.

## Comandos disponibles

### `/help`

Muestra ayuda y sintaxis de comandos.

### `/setProfile`

Crea o actualiza el perfil de candidato de la instancia.

- El bot pregunta cada campo paso a paso.
- En listas, responde con valores separados por comas (`a,b,c`) o `none`.
- Para salario mínimo, responde un número (`>= 0`) o `none`.

### `/cancel`

Cancela un flujo activo de `/setProfile`.

### `/profile`

Muestra el perfil de candidato de la instancia.

### `/deleteProfile`

Elimina el perfil de candidato de la instancia.

### `/createSearch {premise} {periodicity} {scheduledAtUtcHour} {minNotificationRating}`

Crea una búsqueda programada.

Reglas validadas por dominio:

- `periodicity`: `daily`, `weekly`, `biweekly`, `monthly`
- `scheduledAtUtcHour`: formato `HH:mm` (UTC) de `00:00` a `23:59`
- `minNotificationRating`: entre `3` y `5`, en saltos de `0.5`

Ejemplo:

```text
/createSearch senior backend engineer weekly 09:30 4.5
```

### `/searches`

Lista búsquedas programadas:

- id
- premise
- periodicity
- hora UTC
- rating mínimo de notificación

### `/scored`

Lista ofertas puntuadas de todas las búsquedas.

### `/scoredSearch {jobSearchId}`

Lista ofertas puntuadas de una búsqueda concreta.

### `/deleteSearch {jobSearchId}`

Elimina una búsqueda y desprograma su scheduler.

### `/deleteSearchAll`

Elimina todas las búsquedas y desprograma todas.

## Nota multi-tenant

- Los comandos solo se procesan para chats autorizados (`TELEGRAM_CHAT_IDS`).
- Cada chat/grupo autorizado queda aislado (perfil, búsquedas, ofertas puntuadas y notificaciones propias).
- Los chats no autorizados reciben el mensaje de bot privado/self-hosted.

### `/dlq [limit]`

Lista trabajos en dead-letter.

- El mensaje de ayuda dice: default `10`, máximo `30`.
- El código actual no aplica ese default/máximo explícitamente.

## Errores y respuestas

- Errores de validación de dominio se devuelven al usuario.
- Errores internos usan mensaje genérico por comando.
- Comando no reconocido: `Unknown command. Use /help to see available commands.`

## Observaciones de parsing

El parser de argumentos permite premisas con espacios en el primer parámetro (`premise`).
