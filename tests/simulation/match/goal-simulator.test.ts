import { describe, expect, test } from "bun:test";
import { generateGoalEvents } from "../../../src/simulation/match/goal-simulator";
import type { StrengthPlayer } from "../../../src/simulation/match/team-strength";

const lineup: StrengthPlayer[] = [
  { id: 1, teamId: 9, name: "GK", position: "GK", ability: 70 },
  { id: 2, teamId: 9, name: "CB", position: "CB", ability: 70 },
  { id: 3, teamId: 9, name: "CM", position: "CM", ability: 70 },
  { id: 4, teamId: 9, name: "ST", position: "ST", ability: 70 },
];

describe("generateGoalEvents", () => {
  test("returns nothing for zero goals", () => {
    expect(generateGoalEvents(9, lineup, 0, new Set())).toEqual([]);
  });

  test("produces exactly one GOAL event per goal, all for the scoring team", () => {
    const events = generateGoalEvents(9, lineup, 3, new Set());

    expect(events).toHaveLength(3);
    expect(events.every((e) => e.type === "GOAL" && e.teamId === 9)).toBe(true);
  });

  test("every goal has a scorer drawn from the lineup, on a minute 1-90", () => {
    const events = generateGoalEvents(9, lineup, 20, new Set());

    for (const event of events) {
      expect(lineup.some((p) => p.id === event.playerId)).toBe(true);
      expect(event.minute).toBeGreaterThanOrEqual(1);
      expect(event.minute).toBeLessThanOrEqual(90);
    }
  });

  test("respects already-used minutes so two events don't collide", () => {
    const used = new Set<number>();
    const events = generateGoalEvents(9, lineup, 10, used);

    const minutes = events.map((e) => e.minute);
    expect(new Set(minutes).size).toBe(minutes.length);
  });

  test("an assister, when present, is never the same player as the scorer", () => {
    const events = generateGoalEvents(9, lineup, 15, new Set());

    for (const event of events) {
      if (event.secondaryPlayerId !== undefined) {
        expect(event.secondaryPlayerId).not.toBe(event.playerId);
      }
    }
  });

  test("returns nothing when the lineup is empty, without throwing", () => {
    expect(generateGoalEvents(9, [], 2, new Set())).toEqual([]);
  });
});
