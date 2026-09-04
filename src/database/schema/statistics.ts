import {
  integer,
  real,
  sqliteTable,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { cycles } from "./cycles";
import { players } from "./players";

export const playerStatistics = sqliteTable(
  "player_statistics",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    cycleId: integer("cycle_id")
      .notNull()
      .references(() => cycles.id, {
        onDelete: "cascade",
      }),

    playerId: integer("player_id")
      .notNull()
      .references(() => players.id, {
        onDelete: "cascade",
      }),

    appearances: integer("appearances").notNull().default(0),

    starts: integer("starts").notNull().default(0),

    minutes: integer("minutes").notNull().default(0),

    goals: integer("goals").notNull().default(0),

    assists: integer("assists").notNull().default(0),

    shots: integer("shots").notNull().default(0),

    shotsOnTarget: integer("shots_on_target").notNull().default(0),

    yellowCards: integer("yellow_cards").notNull().default(0),

    redCards: integer("red_cards").notNull().default(0),

    averageRating: real("average_rating"),
  },
  (table) => [
    uniqueIndex("player_statistics_cycle_player_unique").on(
      table.cycleId,
      table.playerId,
    ),
  ],
);