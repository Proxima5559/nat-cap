import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const teams = sqliteTable("teams", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  name: text("name").notNull().unique(),

  overall: integer("overall").notNull(),

  region: text("region").notNull(),
});