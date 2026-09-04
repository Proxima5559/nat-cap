import { describe, expect, test } from "bun:test";
import { generateMatchEvents } from "../../../src/simulation/match/event-generator";
import { selectLineup } from "../../../src/simulation/match/lineup";
import type { StrengthPlayer } from "../../../src/simulation/match/team-strength";

function makeSquad(teamId: number, count: number): StrengthPlayer[] {
  return Array.from({ length: count }, (_, i) => ({
    id: teamId * 100 + i,
    teamId,
    name: `p${i}`,
    position: ["GK", "CB", "LB", "RB", "CM", "CM", "LM", "RM", "ST", "ST", "CAM"][i % 11]!,
    ability: 50 + (i % 30),
  }));
}

describe("generateMatchEvents", () => {
  const homeLineup = selectLineup(makeSquad(1, 16));
  const awayLineup = selectLineup(makeSquad(2, 16));

  test("events are sorted by minute, ascending", () => {
    const events = generateMatchEvents(
      { teamId: 1, lineup: homeLineup, goals: 3 },
      { teamId: 2, lineup: awayLineup, goals: 2 },
    );

    const minutes = events.map((e) => e.minute);
    expect(minutes).toEqual([...minutes].sort((a, b) => a - b));
  });

  test("produces exactly the requested number of goals per team", () => {
    const events = generateMatchEvents(
      { teamId: 1, lineup: homeLineup, goals: 4 },
      { teamId: 2, lineup: awayLineup, goals: 1 },
    );

    expect(events.filter((e) => e.type === "GOAL" && e.teamId === 1)).toHaveLength(4);
    expect(events.filter((e) => e.type === "GOAL" && e.teamId === 2)).toHaveLength(1);
  });

  test("never invents an event for a team with no bench (no substitutions)", () => {
    const noBenchLineup = { starters: homeLineup.starters, bench: [] };

    const events = generateMatchEvents(
      { teamId: 1, lineup: noBenchLineup, goals: 0 },
      { teamId: 2, lineup: awayLineup, goals: 0 },
    );

    expect(events.some((e) => e.type === "SUBSTITUTION" && e.teamId === 1)).toBe(false);
  });

  test("every event references a real player from that team's squad", () => {
    const events = generateMatchEvents(
      { teamId: 1, lineup: homeLineup, goals: 2 },
      { teamId: 2, lineup: awayLineup, goals: 2 },
    );

    const homeIds = new Set([...homeLineup.starters, ...homeLineup.bench].map((p) => p.id));
    const awayIds = new Set([...awayLineup.starters, ...awayLineup.bench].map((p) => p.id));

    for (const event of events) {
      const pool = event.teamId === 1 ? homeIds : awayIds;
      expect(pool.has(event.playerId)).toBe(true);
    }
  });
});
