import { describe, expect, test } from "bun:test";
import { matchGenerator } from "../../src/generators";
import type { Fixture } from "../../src/generators";

describe("MatchGenerator.generate", () => {
  test("maps fixtures onto CreateMatchInput with the given tournamentId", () => {
    const fixtures: Fixture[] = [
      { homeTeamId: 1, awayTeamId: 2, round: 1, leg: 1, type: "GROUP" },
      { homeTeamId: 3, awayTeamId: 4, round: 1, leg: 1, type: "GROUP" },
    ];

    const result = matchGenerator.generate(fixtures, 99);

    expect(result).toEqual([
      { tournamentId: 99, homeTeamId: 1, awayTeamId: 2 },
      { tournamentId: 99, homeTeamId: 3, awayTeamId: 4 },
    ]);
  });

  test("drops byes — matches.away_team_id is NOT NULL, a bye isn't a real match", () => {
    const fixtures: Fixture[] = [
      { homeTeamId: 1, awayTeamId: null, round: 1, leg: 1, type: "KNOCKOUT" },
      { homeTeamId: 2, awayTeamId: 3, round: 1, leg: 1, type: "KNOCKOUT" },
    ];

    const result = matchGenerator.generate(fixtures, 5);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ tournamentId: 5, homeTeamId: 2, awayTeamId: 3 });
  });

  test("returns an empty array for no fixtures", () => {
    expect(matchGenerator.generate([], 1)).toEqual([]);
  });
});
