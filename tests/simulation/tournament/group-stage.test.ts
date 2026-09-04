import { beforeEach, describe, expect, test } from "bun:test";
import { runGroupStage } from "../../../src/simulation/tournament/group-stage";
import { makeTeamsAndPlayers, resetFactoryIds } from "../../setup/factories";

beforeEach(() => resetFactoryIds());

describe("runGroupStage", () => {
  test("splits into the requested number of groups and plays every group match", () => {
    const { teams, teamsById, playersByTeam } = makeTeamsAndPlayers(16);

    const result = runGroupStage(
      teams.map((t) => t.id),
      { teamsById, playersByTeam },
      { groupCount: 4, qualifiersPerGroup: 2 },
    );

    expect(result.groups).toHaveLength(4);
    for (const group of result.groups) {
      expect(group.standings).toHaveLength(4);
      expect(group.matches).toHaveLength(6);
    }
  });

  test("qualifies exactly qualifiersPerGroup teams from every group", () => {
    const { teams, teamsById, playersByTeam } = makeTeamsAndPlayers(12);

    const result = runGroupStage(
      teams.map((t) => t.id),
      { teamsById, playersByTeam },
      { groupCount: 3, qualifiersPerGroup: 2 },
    );

    expect(result.qualifiedTeamIds).toHaveLength(6);
  });

  test("orders qualifiers group-winners-first", () => {
    const { teams, teamsById, playersByTeam } = makeTeamsAndPlayers(8);

    const result = runGroupStage(
      teams.map((t) => t.id),
      { teamsById, playersByTeam },
      { groupCount: 2, qualifiersPerGroup: 2 },
    );

    const winners = result.groups.map((g) => g.standings[0]!.teamId);
    expect(new Set(result.qualifiedTeamIds.slice(0, 2))).toEqual(new Set(winners));
  });

  test("every qualified team id actually belongs to the pool", () => {
    const { teams, teamsById, playersByTeam } = makeTeamsAndPlayers(16);
    const teamIds = new Set(teams.map((t) => t.id));

    const result = runGroupStage(
      teams.map((t) => t.id),
      { teamsById, playersByTeam },
      { groupCount: 4, qualifiersPerGroup: 2 },
    );

    for (const id of result.qualifiedTeamIds) {
      expect(teamIds.has(id)).toBe(true);
    }
  });

  test("throws a clear error if a fixture references a team missing from teamsById", () => {
    const { teams, playersByTeam } = makeTeamsAndPlayers(8);
    const incompleteTeamsById = new Map(); 

    expect(() =>
      runGroupStage(
        teams.map((t) => t.id),
        { teamsById: incompleteTeamsById, playersByTeam },
        { groupCount: 2, qualifiersPerGroup: 2 },
      ),
    ).toThrow();
  });
});
