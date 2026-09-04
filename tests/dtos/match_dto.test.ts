import { describe, expect, test } from "bun:test";
import { createMatchDto } from "../../src/dtos";

describe("createMatchDto", () => {
  test("accepts a valid match", () => {
    expect(
      createMatchDto.safeParse({ tournamentId: 1, homeTeamId: 2, awayTeamId: 3 }).success,
    ).toBe(true);
  });

  test("rejects non-positive ids", () => {
    expect(createMatchDto.safeParse({ tournamentId: 0, homeTeamId: 1, awayTeamId: 2 }).success).toBe(false);
    expect(createMatchDto.safeParse({ tournamentId: 1, homeTeamId: -1, awayTeamId: 2 }).success).toBe(false);
  });

  test("rejects a missing awayTeamId", () => {
    expect(createMatchDto.safeParse({ tournamentId: 1, homeTeamId: 1 }).success).toBe(false);
  });
});
