import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { teams } from "./teams";

import { PLAYER_POSITIONS } from "../../data/player_pos";

export const players = sqliteTable(
  "players",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id),

    name: text("name").notNull(),

    position: text("position").notNull(),

    ability: integer("ability").notNull(),
  },
  (table) => [
    check(
      "players_position_check",
      sql`position IN (${sql.raw(PLAYER_POSITIONS.map((p) => `'${p}'`).join(", "))})`
    ),
  ],
);