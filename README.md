# ys-dashboard

A small full-stack dashboard. pnpm monorepo, TypeScript strict ESM.

- `apps/server` — Fastify REST API (`@ys/server`), Drizzle ORM on SQLite.
- `apps/client` — React 18 + Vite SPA (`@ys/client`), TanStack Query + Tailwind + shadcn.
- `packages/contracts` — shared Zod schemas + inferred types (`@ys/contracts`).

## Prerequisites

- Node `>= 20`
- pnpm `10` (`corepack enable` will provide it)

The server uses `better-sqlite3`, a native module. It's allow-listed in the root
`package.json` (`pnpm.onlyBuiltDependencies`), so its build runs during install. If
you ever see "Could not locate the bindings file", rebuild it with
`pnpm rebuild better-sqlite3`.

## How to run the project

```bash
# 1. install dependencies
pnpm install

# 2. create local env files (safe defaults; edit if needed)
cp apps/server/.env.example apps/server/.env
cp apps/client/.env.example apps/client/.env

# 3. start both apps (builds @ys/contracts first, then runs server + client)
pnpm dev
```

- Client: http://localhost:3000
- API: http://localhost:8080
- API docs (Swagger UI): http://localhost:8080/swagger-ui (when `SWAGGER_UI_PREFIX` is set)

The server creates and migrates its SQLite database automatically on boot, so the
first `pnpm dev` is enough to get a working stack with a seeded `GET /api/hello`.

### Run a single app

```bash
pnpm --filter @ys/server dev     # API only (tsx watch)
pnpm --filter @ys/client dev     # client only (vite)
```

## Environment variables

Each app owns its own env (server env is not shared with the client). See the
`.env.example` files for the full list.

### Server (`apps/server/.env`)

| Variable            | Default (dev)           | Notes                                                         |
| ------------------- | ----------------------- | ------------------------------------------------------------- |
| `NODE_ENV`          | `development`           | `development` \| `test` \| `production`                       |
| `HOST`              | `0.0.0.0`               | Required in production                                        |
| `PORT`              | `8080`                  | Required in production                                        |
| `CORS_ORIGIN`       | `http://localhost:3000` | Allowed origin (the client URL). Required in production       |
| `SWAGGER_UI_PREFIX` | _unset_                 | When set, mounts Swagger UI at this path (e.g. `/swagger-ui`) |
| `DATABASE_PATH`     | `./data/app.db`         | SQLite file path. `:memory:` is forced when `NODE_ENV=test`   |

### Client (`apps/client/.env`)

| Variable       | Default                 | Notes                     |
| -------------- | ----------------------- | ------------------------- |
| `VITE_API_URL` | `http://localhost:8080` | Base URL the client calls |

### What `DATABASE_PATH` should be

- **Local dev:** leave the default `./data/app.db` (relative to `apps/server/`,
  gitignored). Nothing to configure.
- **Tests:** ignore it — `:memory:` is selected automatically, so runs are isolated.
- **Production (e.g. Railway):** use an **absolute path on a mounted persistent
  volume**, e.g. `DATABASE_PATH=/data/app.db`. The container filesystem is
  ephemeral, so the DB must live on a volume or it is wiped on every redeploy.

## Database & migrations (Drizzle + better-sqlite3)

Schema lives in `apps/server/src/db/schema.ts`. Migrations are SQL files in
`apps/server/drizzle/` and are **applied automatically when the server boots**
(`runMigrations` in the composition root). You only run the commands below when you
change the schema or want to migrate without starting the server.

```bash
# after editing src/db/schema.ts — generate a new migration SQL file
pnpm --filter @ys/server db:generate

# apply pending migrations to DATABASE_PATH without booting the server
pnpm --filter @ys/server db:migrate
```

Typical workflow for a schema change:

1. Edit `apps/server/src/db/schema.ts`.
2. `pnpm --filter @ys/server db:generate` — creates `drizzle/NNNN_*.sql`.
3. Review the generated SQL (add seed `INSERT`s here if needed) and commit it.
4. `pnpm --filter @ys/server db:migrate` — or just restart the server, which
   applies it on boot.

In production, run `db:migrate` against the volume path before/with the deploy, e.g.
`DATABASE_PATH=/data/app.db pnpm --filter @ys/server db:migrate`.

## Quality checks

```bash
pnpm typecheck   # tsc across all packages
pnpm lint        # eslint
pnpm test        # vitest (server + client)
pnpm format      # prettier --write
```

## Build & production start

```bash
pnpm build                       # build all packages

# server
pnpm --filter @ys/server start   # node dist/index.js (runs migrations on boot)

# client — static output in apps/client/dist (serve with any static host)
pnpm --filter @ys/client preview
```

## Deployment

Target is Railway with two services (server and client). The server needs a
persistent volume for SQLite; set `DATABASE_PATH` to the volume mount path
(e.g. `/data/app.db`) and the production-required vars (`HOST`, `PORT`,
`CORS_ORIGIN`). Full deploy config is TBD.
