import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

import * as schema from "../database/schema";
import { env } from "./vne";

const sqlite = new Database(env.DB_URL);

export const db = drizzle(sqlite, { schema });

export const closeDatabase = () => {
  sqlite.close();
};