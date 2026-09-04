
import { Database } from "bun:sqlite";
import { mkdtempSync, readdirSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const testDir = mkdtempSync(join(tmpdir(), "nat_cup_test_"));
const dbPath = join(testDir, "test.db");

process.env.DB_URL = dbPath;
process.env.PORT ??= "0";

const migrationsDir = join(import.meta.dir, "../../drizzle");
const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

const db = new Database(dbPath);

for (const file of migrationFiles) {
  const sql = readFileSync(join(migrationsDir, file), "utf-8");
  db.run(sql);
}

db.close();
