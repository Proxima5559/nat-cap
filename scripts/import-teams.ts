import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { z } from "zod";

import { db } from "../src/config/database";
import { teams } from "../src/database/schema";
import { players } from "../src/database/schema";
import { PLAYER_POSITIONS } from "../src/data/player_pos";

const playerPositionSchema = z.enum(PLAYER_POSITIONS);

const playerSchema = z.object({
  name: z.string().min(1),
  position: playerPositionSchema,
  ability: z.number().int().min(1).max(100),
});

const teamSchema = z.object({
  overall_rating: z.number().int().min(1).max(100),
  region: z.string().min(1),
  squad: z.array(playerSchema).min(1),
});

const teamsFileSchema = z.record(z.string().min(1), teamSchema);

type TeamsFile = z.infer<typeof teamsFileSchema>;

const DATA_PATH = resolve(
  import.meta.dir,
  "../src/data/squads.json",
);

async function loadTeamsFile(): Promise<TeamsFile> {
  console.log(`📂 Reading: ${DATA_PATH}`);

  const file = await readFile(DATA_PATH, "utf-8");

  let json: unknown;

  try {
    json = JSON.parse(file);
  } catch {
    throw new Error("❌ Invalid JSON file.");
  }

  const result = teamsFileSchema.safeParse(json);

  if (!result.success) {
    console.error("❌ Invalid team data:");

    console.error(
      z.prettifyError(result.error),
    );

    throw new Error("Team data validation failed.");
  }

  return result.data;
}

async function importTeams() {
  console.log("🚀 Starting team import...\n");

  const data = await loadTeamsFile();

  const teamEntries = Object.entries(data);

  console.log(`📊 Teams found: ${teamEntries.length}`);

  const totalPlayers = teamEntries.reduce(
    (total, [, team]) => total + team.squad.length,
    0,
  );

  console.log(`👥 Players found: ${totalPlayers}\n`);

  let importedTeams = 0;
  let importedPlayers = 0;

  await db.transaction(async (tx) => {
    for (const [teamName, teamData] of teamEntries) {
      const [insertedTeam] = await tx
        .insert(teams)
        .values({
          name: teamName,
          overall: teamData.overall_rating,
          region: teamData.region,
        })
        .returning({
          id: teams.id,
        });

      if (!insertedTeam) {
        throw new Error(
          `Failed to insert team: ${teamName}`,
        );
      }

      const playerRows = teamData.squad.map((player) => ({
        teamId: insertedTeam.id,
        name: player.name,
        position: player.position,
        ability: player.ability,
      }));

      await tx.insert(players).values(playerRows);

      importedTeams++;
      importedPlayers += playerRows.length;

      console.log(
        `✅ ${teamName} (${teamData.overall_rating}) — ${playerRows.length} players`,
      );
    }
  });

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Import completed successfully!");
  console.log(`🌍 Teams:   ${importedTeams}`);
  console.log(`👥 Players: ${importedPlayers}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

try {
  await importTeams();
} catch (error) {
  console.error("\n❌ Import failed.");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exit(1);
} finally {
  db.$client.close();
}