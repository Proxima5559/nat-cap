import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const competitions = sqliteTable("competitions", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  name: text("name").notNull(),

  region: text("region").notNull(),

  type: text("type", {
    enum: ["regional", "world"],
  }).notNull(),
});