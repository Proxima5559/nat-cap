import { describe, expect, test } from "bun:test";
import { fixtureGenerator } from "../../src/generators";

describe("FixtureGenerator.generate", () => {
  test("pairs every team exactly once, one game each", () => {
    const teamIds = [1, 2, 3, 4, 5, 6];
    const fixtures = fixtureGenerator.generate(teamIds);

    expect(fixtures).toHaveLength(3);

    const seen = fixtures.flatMap((f) => [f.homeTeamId, f.awayTeamId]);
    expect(new Set(seen)).toEqual(new Set(teamIds));
  });

  test("gives the leftover team a bye on an odd count", () => {
    const fixtures = fixtureGenerator.generate([1, 2, 3]);

    expect(fixtures).toHaveLength(2);
    expect(fixtures.some((f) => f.awayTeamId === null)).toBe(true);
  });

  test("returns nothing for an empty list", () => {
    expect(fixtureGenerator.generate([])).toEqual([]);
  });
});

describe("FixtureGenerator.generateRoundRobin", () => {
  test("every team plays every other team exactly once (single leg)", () => {
    const teamIds = [1, 2, 3, 4, 5];
    const fixtures = fixtureGenerator.generateRoundRobin(teamIds);

    const pairsPlayed = new Set(
      fixtures
        .filter((f) => f.awayTeamId !== null)
        .map((f) => [f.homeTeamId, f.awayTeamId].sort((a, b) => a! - b!).join("-")),
    );

    const expectedPairs = new Set<string>();
    for (let i = 0; i < teamIds.length; i++) {
      for (let j = i + 1; j < teamIds.length; j++) {
        expectedPairs.add([teamIds[i], teamIds[j]].sort((a, b) => a! - b!).join("-"));
      }
    }

    expect(pairsPlayed).toEqual(expectedPairs);
  });

  test("doubles the fixtures on two legs, with home/away reversed", () => {
    const single = fixtureGenerator.generateRoundRobin([1, 2, 3, 4]);
    const double = fixtureGenerator.generateRoundRobin([1, 2, 3, 4], { legs: 2 });

    expect(double).toHaveLength(single.length * 2);

    const reverseFixtureExists = single.every((f) =>
      double.some(
        (g) => g.homeTeamId === f.awayTeamId && g.awayTeamId === f.homeTeamId && g.leg === 2,
      ),
    );
    expect(reverseFixtureExists).toBe(true);
  });

  test("tags every fixture with the group name when given one", () => {
    const fixtures = fixtureGenerator.generateRoundRobin([1, 2, 3], { group: "A" });
    expect(fixtures.every((f) => f.group === "A")).toBe(true);
  });

  test("returns nothing below 2 teams", () => {
    expect(fixtureGenerator.generateRoundRobin([1])).toEqual([]);
    expect(fixtureGenerator.generateRoundRobin([])).toEqual([]);
  });
});

describe("FixtureGenerator.generateGroupStage", () => {
  test("splits teams into the requested number of groups", () => {
    const teamIds = Array.from({ length: 16 }, (_, i) => i + 1);
    const fixtures = fixtureGenerator.generateGroupStage(teamIds, 4);

    const groups = new Set(fixtures.map((f) => f.group));
    expect(groups).toEqual(new Set(["A", "B", "C", "D"]));

    const teamsPerGroup = new Map<string, Set<number>>();
    for (const fixture of fixtures) {
      const set = teamsPerGroup.get(fixture.group!) ?? new Set<number>();
      set.add(fixture.homeTeamId);
      if (fixture.awayTeamId !== null) set.add(fixture.awayTeamId);
      teamsPerGroup.set(fixture.group!, set);
    }

    for (const set of teamsPerGroup.values()) {
      expect(set.size).toBe(4);
    }
  });

  test("refuses a group size that would leave a group with under 2 teams", () => {
    expect(fixtureGenerator.generateGroupStage([1, 2, 3, 4], 4)).toEqual([]);
  });

  test("rejects a non-positive group count", () => {
    expect(fixtureGenerator.generateGroupStage([1, 2, 3, 4], 0)).toEqual([]);
  });
});

describe("FixtureGenerator.generateKnockoutRound", () => {
  test("pairs teams 1-1 on an even count", () => {
    const fixtures = fixtureGenerator.generateKnockoutRound([1, 2, 3, 4], 1);

    expect(fixtures).toHaveLength(2);
    expect(fixtures.every((f) => f.awayTeamId !== null)).toBe(true);
  });

  test("gives exactly one bye on an odd count", () => {
    const fixtures = fixtureGenerator.generateKnockoutRound([1, 2, 3], 1);

    const byes = fixtures.filter((f) => f.awayTeamId === null);
    expect(byes).toHaveLength(1);
    expect(fixtures).toHaveLength(2);
  });

  test("stamps every fixture with the given round number", () => {
    const fixtures = fixtureGenerator.generateKnockoutRound([1, 2, 3, 4], 3);
    expect(fixtures.every((f) => f.round === 3)).toBe(true);
  });
});
