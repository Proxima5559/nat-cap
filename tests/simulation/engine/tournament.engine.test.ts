import { beforeEach, describe, expect, test } from "bun:test";
import { tournamentEngine } from "../../../src/simulation/engine/tournament.engine";
import { makeTeamsAndPlayers, resetFactoryIds } from "../../setup/factories";

beforeEach(() => resetFactoryIds());

describe("TournamentEngine.run — ROUND_ROBIN", () => {
  test("every team plays every other team once, champion is the standings leader", () => {
    const { teams, playersByTeam } = makeTeamsAndPlayers(5);

    const result = tournamentEngine.run({
      name: "Round Robin Cup",
      teams,
      playersByTeam,
      format: { kind: "ROUND_ROBIN" },
    });

    expect(result.allMatches).toHaveLength(10); // C(5,2)
    expect(result.knockoutStage).toBeNull();

    const standings = result.groupStage!.groups[0]!.standings;
    expect(result.championTeamId).toBe(standings[0]!.teamId);
  });
});

describe("TournamentEngine.run — GROUP_KNOCKOUT", () => {
  test("produces a champion drawn from the qualified teams", () => {
    const { teams, playersByTeam } = makeTeamsAndPlayers(16);

    const result = tournamentEngine.run({
      name: "Group Knockout Cup",
      teams,
      playersByTeam,
      format: { kind: "GROUP_KNOCKOUT", groupCount: 4, qualifiersPerGroup: 2 },
    });

    expect(result.groupStage!.qualifiedTeamIds).toHaveLength(8);
    expect(result.knockoutStage!.rounds).toHaveLength(3); // 8 -> 4 -> 2 -> 1
    expect(result.groupStage!.qualifiedTeamIds).toContain(result.championTeamId!);
  });
});

describe("TournamentEngine.run — KNOCKOUT", () => {
  test("seeds the strongest two teams apart so they can't meet in round 1", () => {
    const { teams, playersByTeam } = makeTeamsAndPlayers(4);
    teams[0]!.overall = 90;
    teams[1]!.overall = 40;
    teams[2]!.overall = 35;
    teams[3]!.overall = 85; 

    const result = tournamentEngine.run({
      name: "Knockout Cup",
      teams,
      playersByTeam,
      format: { kind: "KNOCKOUT" },
    });

    const round1 = result.knockoutStage!.rounds[0]!.matches;
    const sameMatch = round1.some(
      (m) =>
        (m.homeTeamId === teams[0]!.id && m.awayTeamId === teams[3]!.id) ||
        (m.homeTeamId === teams[3]!.id && m.awayTeamId === teams[0]!.id),
    );

    expect(sameMatch).toBe(false);
    expect(result.groupStage).toBeNull();
  });
});
