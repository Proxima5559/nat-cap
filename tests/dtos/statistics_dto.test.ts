import { describe, expect, test } from "bun:test";
import { playerStatisticsDto, teamStatisticsDto } from "../../src/dtos";

describe("playerStatisticsDto", () => {
  const base = {
    playerId: 1,
    appearances: 10,
    starts: 8,
    minutes: 720,
    goals: 5,
    assists: 3,
    shots: 20,
    shotsOnTarget: 12,
    yellowCards: 1,
    redCards: 0,
    averageRating: 7.2,
  };

  test("accepts valid statistics", () => {
    expect(playerStatisticsDto.safeParse(base).success).toBe(true);
  });

  test("allows a null averageRating (no matches played yet)", () => {
    expect(playerStatisticsDto.safeParse({ ...base, averageRating: null }).success).toBe(true);
  });

  test("rejects a negative stat", () => {
    expect(playerStatisticsDto.safeParse({ ...base, goals: -1 }).success).toBe(false);
  });

  test("rejects a rating above 10", () => {
    expect(playerStatisticsDto.safeParse({ ...base, averageRating: 10.5 }).success).toBe(false);
  });
});

describe("teamStatisticsDto", () => {
  const base = {
    teamId: 1,
    matches: 5,
    wins: 3,
    draws: 1,
    losses: 1,
    goalsFor: 10,
    goalsAgainst: 4,
    averagePossession: 55.5,
  };

  test("accepts valid statistics", () => {
    expect(teamStatisticsDto.safeParse(base).success).toBe(true);
  });

  test("rejects possession above 100", () => {
    expect(teamStatisticsDto.safeParse({ ...base, averagePossession: 101 }).success).toBe(false);
  });
});
