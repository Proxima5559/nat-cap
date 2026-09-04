import { describe, expect, test } from "bun:test";
import { buildStandings } from "../../../src/simulation/tournament/standings";
import type { MatchResult } from "../../../src/simulation/types/simulation-result";

function match(homeTeamId: number, awayTeamId: number, homeScore: number, awayScore: number): MatchResult {
  return {
    homeTeamId,
    awayTeamId,
    homeScore,
    awayScore,
    possession: { home: 50, away: 50 },
    shots: { home: 10, away: 10 },
    shotsOnTarget: { home: 5, away: 5 },
    events: [],
  };
}

describe("buildStandings", () => {
  test("awards 3 points for a win, 0 for a loss", () => {
    const rows = buildStandings([1, 2], [match(1, 2, 3, 1)]);
    const winner = rows.find((r) => r.teamId === 1)!;
    const loser = rows.find((r) => r.teamId === 2)!;

    expect(winner.points).toBe(3);
    expect(winner.wins).toBe(1);
    expect(loser.points).toBe(0);
    expect(loser.losses).toBe(1);
  });

  test("awards 1 point each for a draw", () => {
    const rows = buildStandings([1, 2], [match(1, 2, 1, 1)]);
    expect(rows.every((r) => r.points === 1 && r.draws === 1)).toBe(true);
  });

  test("tracks goals for/against and goal difference correctly", () => {
    const rows = buildStandings([1, 2], [match(1, 2, 4, 2)]);
    const home = rows.find((r) => r.teamId === 1)!;

    expect(home.goalsFor).toBe(4);
    expect(home.goalsAgainst).toBe(2);
    expect(home.goalDifference).toBe(2);
  });

  test("sorts by points, then goal difference, then goals for, then teamId", () => {
    const rows = buildStandings(
      [1, 2, 3],
      [match(1, 3, 5, 0), match(2, 3, 1, 0)],
    );

    expect(rows.map((r) => r.teamId)).toEqual([1, 2, 3]);
  });

  test("ignores byes entirely — no points, no played count", () => {
    const bye: MatchResult = { ...match(1, 1, 0, 0), isBye: true };
    const rows = buildStandings([1], [bye]);

    expect(rows[0]).toMatchObject({ played: 0, points: 0, wins: 0, draws: 0, losses: 0 });
  });

  test("a team with no matches gets a clean zeroed row", () => {
    const rows = buildStandings([1, 2], [match(1, 2, 2, 0)].concat([]));
    const rows2 = buildStandings([1, 2, 3], [match(1, 2, 2, 0)]);
    const untouched = rows2.find((r) => r.teamId === 3)!;

    expect(untouched).toMatchObject({ played: 0, points: 0, goalsFor: 0, goalsAgainst: 0 });
  });
});
