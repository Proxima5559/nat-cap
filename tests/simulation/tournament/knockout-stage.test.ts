import { beforeEach, describe, expect, test } from "bun:test";
import { runKnockoutBracket } from "../../../src/simulation/tournament/knockout-stage";
import { seedBracket } from "../../../src/simulation/tournament/bracket";
import { makeTeamsAndPlayers, resetFactoryIds } from "../../setup/factories";

beforeEach(() => resetFactoryIds());

describe("runKnockoutBracket", () => {
  test("a single team is champion with no rounds played", () => {
    const { teams, teamsById, playersByTeam } = makeTeamsAndPlayers(1);
    const result = runKnockoutBracket([teams[0]!.id], { teamsById, playersByTeam });

    expect(result.rounds).toEqual([]);
    expect(result.championTeamId).toBe(teams[0]!.id);
  });

  test("no teams means no champion", () => {
    const { teamsById, playersByTeam } = makeTeamsAndPlayers(0);
    const result = runKnockoutBracket([], { teamsById, playersByTeam });

    expect(result.championTeamId).toBeNull();
    expect(result.rounds).toEqual([]);
  });

  test("plays the correct number of rounds for a power-of-two bracket", () => {
    const { teams, teamsById, playersByTeam } = makeTeamsAndPlayers(8);
    const seeded = seedBracket(teams.map((t) => t.id));
    const result = runKnockoutBracket(seeded, { teamsById, playersByTeam });

    expect(result.rounds).toHaveLength(3);
    expect(result.rounds.map((r) => r.matches.length)).toEqual([4, 2, 1]);
  });

  test("the champion is always one of the original entrants", () => {
    const { teams, teamsById, playersByTeam } = makeTeamsAndPlayers(6);
    const result = runKnockoutBracket(teams.map((t) => t.id), { teamsById, playersByTeam });

    expect(teams.map((t) => t.id)).toContain(result.championTeamId!);
  });

  test("every knockout match has a winner, even when scores are level (penalties)", () => {
    const { teams, teamsById, playersByTeam } = makeTeamsAndPlayers(8, 70);
    const result = runKnockoutBracket(teams.map((t) => t.id), { teamsById, playersByTeam });

    for (const round of result.rounds) {
      for (const match of round.matches) {
        expect([match.homeTeamId, match.awayTeamId]).toContain(match.winnerTeamId);
        if (match.homeScore === match.awayScore && !match.isBye) {
          expect(match.wentToPenalties).toBe(true);
          expect(match.penaltyScore!.home).not.toBe(match.penaltyScore!.away);
        }
      }
    }
  });

  test("a bye advances the lone team without a real match", () => {
    const { teams, teamsById, playersByTeam } = makeTeamsAndPlayers(3);
    const seeded = seedBracket(teams.map((t) => t.id));
    const result = runKnockoutBracket(seeded, { teamsById, playersByTeam });

    const byeMatch = result.rounds[0]!.matches.find((m) => m.isBye);
    expect(byeMatch).toBeDefined();
    expect(byeMatch!.homeScore).toBe(0);
    expect(byeMatch!.awayScore).toBe(0);
    expect(byeMatch!.winnerTeamId).toBe(byeMatch!.homeTeamId);
  });

  test("winners of one round feed directly into the next round's fixtures", () => {
    const { teams, teamsById, playersByTeam } = makeTeamsAndPlayers(4);
    const result = runKnockoutBracket(teams.map((t) => t.id), { teamsById, playersByTeam });

    const round1Winners = new Set(result.rounds[0]!.matches.map((m) => m.winnerTeamId));
    const round2Participants = new Set(
      result.rounds[1]!.matches.flatMap((m) => [m.homeTeamId, m.awayTeamId]),
    );

    expect(round2Participants).toEqual(round1Winners);
  });
});
