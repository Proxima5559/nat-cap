import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { tournaments } from "./tournaments";
import { teams } from "./teams";

export const matches = sqliteTable("matches", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  tournamentId: integer("tournament_id")
    .notNull()
    .references(() => tournaments.id, {
      onDelete: "cascade",
    }),

  homeTeamId: integer("home_team_id")
    .notNull()
    .references(() => teams.id),

  awayTeamId: integer("away_team_id")
    .notNull()
    .references(() => teams.id),

  homeScore: integer("home_score"),
  awayScore: integer("away_score"),

  status: text("status", {
    enum: ["scheduled", "live", "completed"],
  })
    .notNull()
    .default("scheduled"),

  playedAt: integer("played_at", {
    mode: "timestamp",
  }),
});