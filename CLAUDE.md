# ys-dashboard — project rules

pnpm monorepo, TypeScript strict ESM, Node >= 20.

- `apps/server` — Fastify REST API (`@ys/server`)
- `apps/client` — React + Vite SPA (`@ys/client`)
- `packages/contracts` — shared Zod schemas + inferred types (`@ys/contracts`)

App-specific rules live in `apps/<app>/CLAUDE.md` and only describe what differs
from this file.

## Run locally

- `pnpm dev` — builds `@ys/contracts`, then runs server + client in parallel.
  Server on `:8080`, client on `:3000`.
- Copy each app's `.env.example` → `.env` before first run.
- Deploy: TBD (Railway, two services planned) — documented later.

## Workflow

- Before calling a task done, run `pnpm typecheck`, `pnpm lint`, and the relevant
  `pnpm test`.
- Never commit unless explicitly asked.
- Never add a dependency without asking first.
- Keep changes tightly scoped — no unrequested refactors or cleanup.

## Code style

- Minimal comments; code should be self-explanatory. Comment only non-obvious logic.
- Prefix unused parameters with `_`.
- No `void` operator for fire-and-forget promises — use a block statement.
- ESM: relative imports use `.js` extensions (NodeNext on the server).
- Prettier: single quotes, semicolons, trailing commas `all`, width 100, 2-space indent.
- Utility functions live in their own file and are covered with tests.

## Contracts

- All API request/response schemas live in `@ys/contracts` as Zod schemas, with
  types via `z.infer`.
- Per-app env stays app-local; only API contracts are shared.

## Testing

- Vitest + `@testing-library/react`.
- Test files named `*.test.ts(x)`.

## Skills

- `vercel-react-best-practices` — client React work.
- `fastify-best-practices` — server work.
- `sqlite-database-expert` — SQLite work (when available).
