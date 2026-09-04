import { describe, expect, test } from "bun:test";
import { competitionGenerator, cycleGenerator, tournamentGenerator } from "../../src/generators";

describe("CompetitionGenerator", () => {
  test("defaults the name to '<region> Championship'", () => {
    const competition = competitionGenerator.generate("europe");
    expect(competition).toEqual({ name: "europe Championship", region: "europe", type: "regional" });
  });

  test("uses the given name when provided", () => {
    const competition = competitionGenerator.generate("europe", "Euro Cup");
    expect(competition.name).toBe("Euro Cup");
  });
});

describe("CycleGenerator", () => {
  test("uses the given seed when provided", () => {
    expect(cycleGenerator.generate(42)).toEqual({ seed: 42 });
  });

  test("generates a positive seed when none is given", () => {
    const cycle = cycleGenerator.generate();
    expect(cycle.seed).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(cycle.seed)).toBe(true);
  });
});

describe("TournamentGenerator", () => {
  test("creates a tournament in 'created' status with the given name", () => {
    expect(tournamentGenerator.generate("World Cup")).toEqual({
      name: "World Cup",
      status: "created",
    });
  });
});
