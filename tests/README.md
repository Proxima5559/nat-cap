# Tests

Uses `bun:test`. Everything here is self-contained inside `tests/`.

## Layout

- `tests/setup/global-setup.ts` — creates a fresh temp sqlite file, runs
  every `.sql` file under `drizzle/` against it, and points `DB_URL` (and
  `PORT`, since `src/config/vne.ts` requires both) at it. Needs to run
  **before** any test file imports anything from `src/`, since that module
  reads `process.env` at import time and exits the process if it's missing.
- `tests/setup/factories.ts` — shared builders for the plain simulation
  objects (`StrengthTeam` / `StrengthPlayer`) used across `tests/simulation/`.
- `tests/services/test-helpers.ts` — `uniqueName()`, since all service tests
  share one on-disk sqlite file for the whole run (no per-test reset) and
  `teams.name` is unique.
- `tests/generators/`, `tests/simulation/`, `tests/dtos/`, `tests/utils/` —
  pure logic, no database needed.
- `tests/services/`, `tests/routes/` — hit a real (temp, migrated) sqlite db
  through the service/route layer.

## Running

This repo has no migrations checked in and no `bunfig.toml` preload wired up
yet, so two things need to exist for the db-backed suites
(`tests/services/`, `tests/routes/`) to run — pure-logic suites
(`tests/generators/`, `tests/simulation/`, `tests/dtos/`, `tests/utils/`)
don't need either:

1. Migrations under `drizzle/` — generate with
   `DB_URL=/tmp/x.db PORT=3000 bunx drizzle-kit generate` (both env vars are
   required by `src/config/vne.ts` even though only `DB_URL` matters here).
2. A `bunfig.toml` at the project root:
   ```toml
   [test]
   preload = ["./tests/setup/global-setup.ts"]
   ```

Then: `bun test`
