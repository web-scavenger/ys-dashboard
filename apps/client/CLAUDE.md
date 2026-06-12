# Client rules (`@ys/client`)

Diffs from the root `CLAUDE.md`. React 18 + Vite, TanStack React Query, Tailwind v4 +
shadcn.

## Feature structure

Each feature lives in `src/features/<feature>/`:

- `api/` — data access (React Query hooks, request calls).
- `components/` — feature components.
- `lib/` — feature-local helpers.
- `types.ts` — feature types.
- `__tests__/` — UI tests for the feature.

## Components

- One component per file; extract additional components into their own files.
- No inline/anonymous functions as JSX props — implement a named handler and pass the
  reference.
- App-level providers (QueryClient, etc.) live in their own file.

## Data

- TanStack React Query for server state.
- `api.request()` parses every response through a `@ys/contracts` Zod schema, so
  contract drift throws instead of silently casting.

## Styling

- Tailwind v4 + shadcn (radix).

## Tests

- UI tests under `src/features/<feature>/__tests__`, using Vitest +
  `@testing-library/react`.
