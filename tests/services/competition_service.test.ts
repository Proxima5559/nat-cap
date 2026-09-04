import { describe, expect, test } from "bun:test";
import { competitionService, tournamentService, cycleService } from "../../src/services";
import { uniqueName } from "./test-helpers";

describe("CompetitionService", () => {
  test("createCompetition then getCompetitionById round-trips the same data", async () => {
    const competition = await competitionService.createCompetition({
      name: uniqueName("Euro Cup"),
      region: "europe",
      type: "regional",
    });

    expect(competition.id).toBeGreaterThan(0);

    const fetched = await competitionService.getCompetitionById(competition.id);
    expect(fetched).toEqual(competition);
  });

  test("getCompetitionById returns null for a competition that doesn't exist", async () => {
    expect(await competitionService.getCompetitionById(999_999)).toBeNull();
  });

  test("getCompetitionsByRegion only returns competitions from that region", async () => {
    const name = uniqueName("Asia Championship");
    await competitionService.createCompetition({ name, region: "asia", type: "regional" });

    const results = await competitionService.getCompetitionsByRegion("asia");
    expect(results.some((c) => c.name === name)).toBe(true);
    expect(results.every((c) => c.region === "asia")).toBe(true);
  });

  test("getCompetitionTournaments lists tournaments created under that competition", async () => {
    const competition = await competitionService.createCompetition({
      name: uniqueName("Linked Championship"),
      region: "africa",
      type: "regional",
    });
    const cycle = await cycleService.createCycle({ seed: Date.now() });
    const tournament = await tournamentService.createTournament({
      cycleId: cycle.id,
      competitionId: competition.id,
      name: uniqueName("Linked Tournament"),
    });

    const tournaments = await competitionService.getCompetitionTournaments(competition.id);
    expect(tournaments.some((t) => t.id === tournament.id)).toBe(true);
  });

  test("createCompetition rejects an unknown type", async () => {
    await expect(
      competitionService.createCompetition({
        name: "Bad Competition",
        region: "europe",
        // @ts-expect-error - deliberately invalid to exercise createCompetitionDto validation
        type: "continental",
      }),
    ).rejects.toThrow();
  });
});
