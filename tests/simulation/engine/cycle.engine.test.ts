import { beforeEach, describe, expect, test } from "bun:test";
import { cycleEngine, type RegionEntry } from "../../../src/simulation/engine/cycle.engine";
import { WORLD_CUP_48_QUALIFICATION } from "../../../src/simulation/tournament/qualification";
import { makeSquad, makeTeamsAndPlayers, resetFactoryIds } from "../../setup/factories";

beforeEach(() => resetFactoryIds());

const REGION_SIZES: Record<string, number> = {
  europe: 20,
  africa: 15,
  asia: 15,
  south_america: 10,
  north_america: 12,
  oceania: 5,
};

function buildFullScaleInput() {
  const regions: RegionEntry[] = [];
  const playersByTeam = new Map();

  for (const [region, count] of Object.entries(REGION_SIZES)) {
    const { teams, playersByTeam: regionPlayers } = makeTeamsAndPlayers(count);
    for (const [id, players] of regionPlayers) playersByTeam.set(id, players);
    regions.push({ region: region as RegionEntry["region"], teams });
  }

  return { regions, playersByTeam };
}

describe("CycleEngine.run — full 48-team qualification", () => {
  test("every confederation qualifies exactly its direct + play-off quota", () => {
    const { regions, playersByTeam } = buildFullScaleInput();
    const result = cycleEngine.run({ seed: 1, regions, playersByTeam });

    for (const regional of result.regionalResults) {
      const quota =
        WORLD_CUP_48_QUALIFICATION.allocation[
          regional.region as keyof typeof WORLD_CUP_48_QUALIFICATION.allocation
        ];

      expect(regional.directQualifierTeamIds).toHaveLength(quota.direct);
      expect(regional.playoffContestantTeamIds).toHaveLength(quota.playoff);
    }
  });

  test("the inter-confederation play-off pools exactly the 6 contestants and returns 2 winners", () => {
    const { regions, playersByTeam } = buildFullScaleInput();
    const result = cycleEngine.run({ seed: 2, regions, playersByTeam });

    expect(result.interConfederationPlayoff!.contestantTeamIds).toHaveLength(6);
    expect(result.interConfederationPlayoff!.qualifiedTeamIds).toHaveLength(2);
  });

  test("the World Cup field is exactly 48 unique teams", () => {
    const { regions, playersByTeam } = buildFullScaleInput();
    const result = cycleEngine.run({ seed: 3, regions, playersByTeam });

    const teamsInFinals = new Set(
      result.world!.allMatches.flatMap((m) => [m.homeTeamId, m.awayTeamId]),
    );

    const groupTeams = new Set(
      result.world!.groupStage!.groups.flatMap((g) => g.standings.map((s) => s.teamId)),
    );

    expect(groupTeams.size).toBe(48);
    expect(teamsInFinals.size).toBeLessThanOrEqual(48);
  });

  test("produces a single World Champion drawn from the qualified field", () => {
    const { regions, playersByTeam } = buildFullScaleInput();
    const result = cycleEngine.run({ seed: 4, regions, playersByTeam });

    const qualifiedIds = new Set(
      result.world!.groupStage!.groups.flatMap((g) => g.standings.map((s) => s.teamId)),
    );

    expect(result.world!.championTeamId).not.toBeNull();
    expect(qualifiedIds.has(result.world!.championTeamId!)).toBe(true);
  });

  test("a region with fewer than 2 teams is skipped entirely, not crashed on", () => {
    const { teams, playersByTeam } = makeTeamsAndPlayers(1);
    const regions: RegionEntry[] = [{ region: "oceania", teams }];

    const result = cycleEngine.run({ seed: 5, regions, playersByTeam });

    expect(result.regionalResults).toEqual([]);
    expect(result.world).toBeNull();
  });

  test("small regions (below the default group-stage minimum) still qualify via round robin/knockout fallback", () => {
    const { teams: oceaniaTeams, playersByTeam } = makeTeamsAndPlayers(5);
    const regions: RegionEntry[] = [{ region: "oceania", teams: oceaniaTeams }];

    const result = cycleEngine.run({ seed: 6, regions, playersByTeam });

    const oceania = result.regionalResults[0]!;
    expect(oceania.tournament.championTeamId).not.toBeNull();
    expect(oceania.directQualifierTeamIds).toHaveLength(1);
    expect(oceania.playoffContestantTeamIds).toHaveLength(1);
  });
});
