import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const cycles = sqliteTable("cycles", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  seed: integer("seed").notNull(),

  status: text("status", {
    enum: ["created", "running", "completed", "failed"],
  })
    .notNull()
    .default("created"),

  createdAt: integer("created_at", {
    mode: "timestamp",
  }).notNull(),

  completedAt: integer("completed_at", {
    mode: "timestamp",
  }),
});