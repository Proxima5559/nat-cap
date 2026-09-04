import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { matches } from "./matches";
import { players } from "./players";
import { teams } from "./teams";

export const matchEvents = sqliteTable("match_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  matchId: integer("match_id")
    .notNull()
    .references(() => matches.id, {
      onDelete: "cascade",
    }),

  minute: integer("minute").notNull(),

  type: text("type").notNull(),

  teamId: integer("team_id").references(() => teams.id, {
    onDelete: "set null",
  }),

  playerId: integer("player_id").references(() => players.id, {
    onDelete: "set null",
  }),

  secondaryPlayerId: integer("secondary_player_id").references(
    () => players.id,
    {
      onDelete: "set null",
    },
  ),

  description: text("description"),
});