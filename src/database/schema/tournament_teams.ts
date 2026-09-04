import {
  integer,
  primaryKey,
  sqliteTable,
} from "drizzle-orm/sqlite-core";
import { tournaments } from "./tournaments";
import { teams } from "./teams";

export const tournamentTeams = sqliteTable(
  "tournament_teams",
  {
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
  },
  (table) => [
    primaryKey({
      columns: [table.tournamentId, table.teamId],
    }),
  ],
);