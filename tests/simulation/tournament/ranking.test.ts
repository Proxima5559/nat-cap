import { describe, expect, test } from "bun:test";
import { rankTournamentParticipants } from "../../../src/simulation/tournament/ranking";
import type {
  KnockoutRoundResult,
  StandingsRow,
  TournamentResult,
} from "../../../src/simulation/types/simulation-result";

function standingsRow(teamId: number, points: number): StandingsRow {
  return { teamId, played: 3, wins: 1, draws: 0, losses: 2, goalsFor: 2, goalsAgainst: 2, goalDifference: 0, points };
}

describe("rankTournamentParticipants", () => {
  test("champion ranks first, then the final loser, then earlier-round losers", () => {
    const rounds: KnockoutRoundResult[] = [
      {
        round: 1,
        matches: [
          { homeTeamId: 1, awayTeamId: 4, homeScore: 2, awayScore: 0, possession: { home: 50, away: 50 }, shots: { home: 5, away: 5 }, shotsOnTarget: { home: 3, away: 3 }, events: [], winnerTeamId: 1 },
          { homeTeamId: 2, awayTeamId: 3, homeScore: 1, awayScore: 0, possession: { home: 50, away: 50 }, shots: { home: 5, away: 5 }, shotsOnTarget: { home: 3, away: 3 }, events: [], winnerTeamId: 2 },
        ],
      },
      {
        round: 2,
        matches: [
          { homeTeamId: 1, awayTeamId: 2, homeScore: 3, awayScore: 1, possession: { home: 50, away: 50 }, shots: { home: 5, away: 5 }, shotsOnTarget: { home: 3, away: 3 }, events: [], winnerTeamId: 1 },
        ],
      },
    ];

    const tournament: TournamentResult = {
      name: "Test Cup",
      format: "KNOCKOUT",
      groupStage: null,
      knockoutStage: { rounds, championTeamId: 1 },
      allMatches: [],
      championTeamId: 1,
    };

    const ranked = rankTournamentParticipants(tournament, [1, 2, 3, 4]);

    expect(ranked[0]).toBe(1); // champion
    expect(ranked[1]).toBe(2); // final loser
    // 3 and 4 both lost round 1 — order between them isn't guaranteed, but both rank below the finalists.
    expect(new Set(ranked.slice(2))).toEqual(new Set([3, 4]));
  });

  test("teams that never reached the knockout are ranked by group-stage points", () => {
    const tournament: TournamentResult = {
      name: "Test Cup",
      format: "GROUP_KNOCKOUT",
      groupStage: {
        groups: [
          {
            group: "A",
            standings: [standingsRow(10, 9), standingsRow(11, 6), standingsRow(12, 3), standingsRow(13, 0)],
            matches: [],
          },
        ],
        qualifiedTeamIds: [10, 11],
      },
      knockoutStage: { rounds: [], championTeamId: 10 },
      allMatches: [],
      championTeamId: 10,
    };

    const ranked = rankTournamentParticipants(tournament, [10, 11, 12, 13]);

    // 12 (3 pts) should outrank 13 (0 pts) even though neither reached the knockout.
    expect(ranked.indexOf(12)).toBeLessThan(ranked.indexOf(13));
  });

  test("includes every team exactly once, even ones absent from both stages", () => {
    const tournament: TournamentResult = {
      name: "Test Cup",
      format: "KNOCKOUT",
      groupStage: null,
      knockoutStage: { rounds: [], championTeamId: null },
      allMatches: [],
      championTeamId: null,
    };

    const ranked = rankTournamentParticipants(tournament, [5, 6, 7]);

    expect(new Set(ranked)).toEqual(new Set([5, 6, 7]));
    expect(ranked).toHaveLength(3);
  });
});
