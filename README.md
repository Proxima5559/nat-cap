# nat_cup ⚽
 
A simulated international football world: club/national teams play through
regional qualifying tournaments, and a real World Cup confederation quota
system decides who makes it to the finals.
 
Built with [Bun](https://bun.sh), [Elysia](https://elysiajs.com),
[Drizzle ORM](https://orm.drizzle.team) over SQLite, and
[GraphQL Yoga](https://the-guild.dev/graphql/yoga-server).
 
## How it works
 
```
CYCLE
  └── each confederation (region) runs its own regional tournament
        └── group stage → knockout stage → a full final ranking
              ├── top N teams  → direct World Cup slot
              └── next M teams → shared inter-confederation play-off pool
  └── inter-confederation play-off resolves the last couple of spots
  └── World Cup: direct qualifiers + play-off winners
        └── group stage → knockout stage → World Champion
```
 
The confederation quotas mirror the real thing — by default this runs the
current 48-team format (16 UEFA, 9+1 CAF, 8+1 AFC, 6+1 CONMEBOL, 6+2
CONCACAF, 1+1 OFC), with the 1998–2022 32-team format available as an
alternate preset. See `src/simulation/tournament/qualification.ts`.
 
Every match is simulated from a team's overall rating blended with the
actual lineup put out (position-aware XI selection, not just top-11-by-
ability), with tactics (attacking/balanced/defensive) chosen from the
strength gap between the two sides, and a possession → shots → shots-on-
target → goals model producing the final score, goal/assist/card/
substitution events, and — in the knockout stage — penalty shootouts when a
tie needs breaking. See `src/simulation/` for the full breakdown.
 
**Teams aren't seeded anywhere in this repo** — which teams exist, and
which confederation they belong to, is entirely up to whoever's running it,
added through the API.
 
## Project structure
 
```
src/
  app.ts              — App class: wires up Elysia, REST routes, GraphQL, swagger
  main.ts             — entry point, just calls App.listen()
  config/             — env validation, drizzle/sqlite connection
  database/schema/     — drizzle table definitions
  dtos/                — zod schemas + inferred types, shared by REST & services
  generators/          — builds tournament *structure*: fixtures, competitions,
                          cycles — no match simulation happens here
  simulation/          — the actual match/tournament/cycle engines (pure,
                          no DB access) — see src/simulation for the full tree
  services/            — DB-backed business logic per resource
  controlers/, routes/ — REST layer (Elysia), one pair of files per resource
  graphql/              — schema + resolvers, mounted at /graphql
tests/                  — bun:test suite mirroring src/ (see tests/README.md)
```
 
## Getting started
 
```bash
bun install
```
 
Create a `.env` (or export directly) with:
 
```
DB_URL=./dev.db
PORT=3000
```
 
Generate and apply the schema:
 
```bash
bun run db:generate
bun run db:migrate
```
 
Run it:
 
```bash
bun run dev
```
 
- REST API at `http://localhost:3000`
- Swagger docs at `http://localhost:3000/docs`
- GraphQL playground at `http://localhost:3000/graphql`
- Health check at `http://localhost:3000/health`
## API
 
REST resources: `/competitions`, `/cycles`, `/matches`, `/players`,
`/statistics`, `/teams`, `/tournaments` — see `/docs` for the full,
always-current schema (request/response shapes, per-route validation).
 
GraphQL exposes the same domain (competitions, cycles, matches, players,
statistics, teams, tournaments) as queries/mutations — see `/graphql` for
the schema explorer.
 
## Testing
 
```bash
bun test
```
 
See [`tests/README.md`](./tests/README.md) — the db-backed suites need
migrations generated and a `bunfig.toml` preload pointed at
`tests/setup/global-setup.ts` first.
