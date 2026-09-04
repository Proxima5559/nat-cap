import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { cycles } from "./cycles";
import { competitions } from "./competitions";

export const tournaments = sqliteTable("tournaments", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  cycleId: integer("cycle_id")
    .notNull()
    .references(() => cycles.id),

  competitionId: integer("competition_id")
    .notNull()
    .references(() => competitions.id),

  name: text("name").notNull(),

  status: text("status", {
    enum: ["created", "running", "completed"],
  })
    .notNull()
    .default("created"),

  startedAt: integer("started_at", {
    mode: "timestamp",
  }),

  completedAt: integer("completed_at", {
    mode: "timestamp",
  }),
});