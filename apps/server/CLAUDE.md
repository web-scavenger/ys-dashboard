# Server rules (`@ys/server`)

Diffs from the root `CLAUDE.md`. Fastify + Zod, manual composition root (no DI
framework, no ORM injected into services).

## Module structure

Each feature lives in `src/modules/<feature>/`:

- `<feature>.module.ts` — builds `repository → service → controller` and exposes a
  register function.
- `<feature>.controller.ts` — HTTP routes; delegates to the service.
- `<feature>.service.ts` — business logic; depends on the repository interface only.
- `repositories/` — repository interface + implementation(s).
- `dto/` — request/response Zod schemas.
- `entities/` — domain/persistence types.
- `__tests__/` — tests for the module.

## Wiring

- `<feature>.module.ts` wires the graph via plain constructor injection and is
  registered from `composition-root.ts`.
- No DI framework, no provider tokens. "Provider" = the repository class passed as a
  constructor argument.

## Repository rule

- Define a repository interface + implementation per module.
- Services depend on the repository interface only.
- Never inject the ORM (Drizzle) into a service — it is used only inside repository
  implementations.

## Validation & errors

- Zod via `fastify-type-provider-zod` is the single source of truth for route
  validation and serialization; DTOs as Zod schemas under `dto/`.
- `AppError` subclasses + the global error handler produce a uniform
  `{ statusCode, error, message }` envelope.

## Config

- Env loaded via `loadConfig()` (Zod). Production-required vars are enforced at boot.

## Storage

- Drizzle ORM on `better-sqlite3`. Schema + migrations via `drizzle-kit`.
- Accessed only through repository implementations.
