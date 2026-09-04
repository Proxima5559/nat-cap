import {
  integer,
  sqliteTable,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { tournaments } from "./tournaments";
import { teams } from "./teams";

export const standings = sqliteTable(
  "standings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    tournamentId: integer("tournament_id")
      .notNull()
      .references(() => tournaments.id, {
        onDelete: "cascade",
      }),

    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, {
        onDelete: "cascade",
      }),

    played: integer("played").notNull().default(0),

    wins: integer("wins").notNull().default(0),

    draws: integer("draws").notNull().default(0),

    losses: integer("losses").notNull().default(0),

    goalsFor: integer("goals_for").notNull().default(0),

    goalsAgainst: integer("goals_against").notNull().default(0),

    points: integer("points").notNull().default(0),
  },
  (table) => [
    uniqueIndex("standings_tournament_team_unique").on(
      table.tournamentId,
      table.teamId,
    ),
  ],
);