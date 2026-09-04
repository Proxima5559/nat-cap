import { z } from "zod";

const envSchema = z.object({
  DB_URL: z.string().min(1, "Database URL is required"),
  PORT: z.string().min(1, "Port is required").transform((val) => parseInt(val, 10)),
});

const parseEnv = envSchema.safeParse(process.env);

if (!parseEnv.success) {
  console.error("❌ Invalid environment variables:", parseEnv.error.format());
  process.exit(1);
}

export const env = parseEnv.data;
