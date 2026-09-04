import { describe, expect, test } from "bun:test";
import { createTournamentDto } from "../../src/dtos";

describe("createTournamentDto", () => {
  test("accepts a valid tournament", () => {
    expect(
      createTournamentDto.safeParse({ cycleId: 1, competitionId: 2, name: "World Cup" }).success,
    ).toBe(true);
  });

  test("rejects non-positive foreign keys", () => {
    expect(createTournamentDto.safeParse({ cycleId: 0, competitionId: 1, name: "X" }).success).toBe(false);
  });

  test("rejects an empty name", () => {
    expect(createTournamentDto.safeParse({ cycleId: 1, competitionId: 1, name: "" }).success).toBe(false);
  });

  test("rejects a name over 150 characters", () => {
    expect(
      createTournamentDto.safeParse({ cycleId: 1, competitionId: 1, name: "a".repeat(151) }).success,
    ).toBe(false);
  });
});
