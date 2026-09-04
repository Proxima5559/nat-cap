import { defineConfig } from "drizzle-kit";
import { env } from "./src/config/vne"; 

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/database/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.DB_URL,
  },
});
