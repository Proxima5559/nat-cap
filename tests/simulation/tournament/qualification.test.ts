import { beforeEach, describe, expect, test } from "bun:test";
import {
  runInterConfederationPlayoff,
  WORLD_CUP_32_QUALIFICATION,
  WORLD_CUP_48_QUALIFICATION,
} from "../../../src/simulation/tournament/qualification";
import { makeTeamsAndPlayers, resetFactoryIds } from "../../setup/factories";

beforeEach(() => resetFactoryIds());

describe("WORLD_CUP_48_QUALIFICATION", () => {
  test("adds up to 46 direct + 2 play-off slots = 48", () => {
    const totalDirect = Object.values(WORLD_CUP_48_QUALIFICATION.allocation).reduce(
      (sum, a) => sum + a.direct,
      0,
    );

    expect(totalDirect).toBe(46);
    expect(WORLD_CUP_48_QUALIFICATION.interConfederationFinalSlots).toBe(2);
  });

  test("matches the confederation quotas given: UEFA 16, CAF 9+1, AFC 8+1, CONMEBOL 6+1, CONCACAF 6+2, OFC 1+1", () => {
    expect(WORLD_CUP_48_QUALIFICATION.allocation.europe).toEqual({ direct: 16, playoff: 0 });
    expect(WORLD_CUP_48_QUALIFICATION.allocation.africa).toEqual({ direct: 9, playoff: 1 });
    expect(WORLD_CUP_48_QUALIFICATION.allocation.asia).toEqual({ direct: 8, playoff: 1 });
    expect(WORLD_CUP_48_QUALIFICATION.allocation.south_america).toEqual({ direct: 6, playoff: 1 });
    expect(WORLD_CUP_48_QUALIFICATION.allocation.north_america).toEqual({ direct: 6, playoff: 2 });
    expect(WORLD_CUP_48_QUALIFICATION.allocation.oceania).toEqual({ direct: 1, playoff: 1 });
  });
});

describe("WORLD_CUP_32_QUALIFICATION", () => {
  test("adds up to 32 total slots", () => {
    const totalDirect = Object.values(WORLD_CUP_32_QUALIFICATION.allocation).reduce(
      (sum, a) => sum + a.direct,
      0,
    );

    expect(totalDirect + WORLD_CUP_32_QUALIFICATION.interConfederationFinalSlots).toBe(32);
  });
});

describe("runInterConfederationPlayoff", () => {
  test("returns exactly finalSlots qualifiers when there are enough contestants", () => {
    const { teams, teamsById, playersByTeam } = makeTeamsAndPlayers(6);
    const qualifiers = runInterConfederationPlayoff(teams, 2, { teamsById, playersByTeam });

    expect(qualifiers).toHaveLength(2);
    expect(new Set(qualifiers).size).toBe(2); // no duplicates
  });

  test("every qualifier is one of the original contestants", () => {
    const { teams, teamsById, playersByTeam } = makeTeamsAndPlayers(6);
    const contestantIds = new Set(teams.map((t) => t.id));
    const qualifiers = runInterConfederationPlayoff(teams, 2, { teamsById, playersByTeam });

    for (const id of qualifiers) {
      expect(contestantIds.has(id)).toBe(true);
    }
  });

  test("returns nothing when there are no contestants", () => {
    const { teamsById, playersByTeam } = makeTeamsAndPlayers(0);
    expect(runInterConfederationPlayoff([], 2, { teamsById, playersByTeam })).toEqual([]);
  });

  test("returns nothing when finalSlots is zero", () => {
    const { teams, teamsById, playersByTeam } = makeTeamsAndPlayers(4);
    expect(runInterConfederationPlayoff(teams, 0, { teamsById, playersByTeam })).toEqual([]);
  });

  test("copes with fewer contestants than paths (some paths empty)", () => {
    const { teams, teamsById, playersByTeam } = makeTeamsAndPlayers(1);
    const qualifiers = runInterConfederationPlayoff(teams, 2, { teamsById, playersByTeam });

    expect(qualifiers).toEqual([teams[0]!.id]);
  });
});
