import { describe, expect, test } from "bun:test";
import { selectLineup, DEFAULT_FORMATION } from "../../../src/simulation/match/lineup";
import type { StrengthPlayer } from "../../../src/simulation/match/team-strength";

function makeSquad(overrides: Partial<StrengthPlayer>[] = []): StrengthPlayer[] {
  const base: StrengthPlayer[] = [
    { id: 1, teamId: 1, name: "GK1", position: "GK", ability: 70 },
    { id: 2, teamId: 1, name: "GK2", position: "GK", ability: 60 },
    { id: 3, teamId: 1, name: "CB1", position: "CB", ability: 75 },
    { id: 4, teamId: 1, name: "CB2", position: "CB", ability: 72 },
    { id: 5, teamId: 1, name: "LB1", position: "LB", ability: 68 },
    { id: 6, teamId: 1, name: "RB1", position: "RB", ability: 69 },
    { id: 7, teamId: 1, name: "CM1", position: "CM", ability: 80 },
    { id: 8, teamId: 1, name: "CM2", position: "CM", ability: 78 },
    { id: 9, teamId: 1, name: "LM1", position: "LM", ability: 65 },
    { id: 10, teamId: 1, name: "RM1", position: "RM", ability: 66 },
    { id: 11, teamId: 1, name: "ST1", position: "ST", ability: 85 },
    { id: 12, teamId: 1, name: "ST2", position: "ST", ability: 82 },
    { id: 13, teamId: 1, name: "Bench1", position: "CM", ability: 55 },
    { id: 14, teamId: 1, name: "Bench2", position: "CB", ability: 50 },
  ];

  return overrides.length > 0 ? (overrides as StrengthPlayer[]) : base;
}

describe("selectLineup", () => {
  test("fields exactly the formation's total against a full squad", () => {
    const { starters } = selectLineup(makeSquad(), DEFAULT_FORMATION);
    const total = DEFAULT_FORMATION.GK + DEFAULT_FORMATION.DEF + DEFAULT_FORMATION.MID + DEFAULT_FORMATION.FWD;

    expect(starters).toHaveLength(total);
  });

  test("fills each position group up to its formation need, best ability first", () => {
    const { starters } = selectLineup(makeSquad(), DEFAULT_FORMATION);

    const gks = starters.filter((p) => p.position === "GK");
    expect(gks).toHaveLength(1);
    expect(gks[0]!.id).toBe(1); // ability 70 > 60

    const centerMids = starters.filter((p) => p.position === "CM");
    expect(centerMids.map((p) => p.id).sort()).toEqual([7, 8]);
  });

  test("starters and bench never overlap and together cover the whole squad", () => {
    const squad = makeSquad();
    const { starters, bench } = selectLineup(squad, DEFAULT_FORMATION);

    const starterIds = new Set(starters.map((p) => p.id));
    const benchIds = new Set(bench.map((p) => p.id));

    expect(starterIds.size + benchIds.size).toBe(squad.length);
    for (const id of starterIds) {
      expect(benchIds.has(id)).toBe(false);
    }
  });

  test("tops up the XI from the best remaining players when a position group is short", () => {
    const squad: StrengthPlayer[] = [
      { id: 1, teamId: 1, name: "a", position: "CB", ability: 90 },
      { id: 2, teamId: 1, name: "b", position: "CB", ability: 85 },
      { id: 3, teamId: 1, name: "c", position: "CM", ability: 80 },
      { id: 4, teamId: 1, name: "d", position: "ST", ability: 75 },
    ];

    const { starters } = selectLineup(squad, { GK: 1, DEF: 1, MID: 1, FWD: 1 });

    expect(starters).toHaveLength(4);
    expect(starters.some((p) => p.position === "GK")).toBe(false);
  });

  test("never fields more players than the squad has", () => {
    const smallSquad = makeSquad().slice(0, 5);
    const { starters, bench } = selectLineup(smallSquad, DEFAULT_FORMATION);

    expect(starters.length + bench.length).toBe(5);
    expect(starters.length).toBeLessThanOrEqual(5);
  });

  test("handles an empty squad without throwing", () => {
    expect(selectLineup([])).toEqual({ starters: [], bench: [] });
  });
});
