import { describe, expect, test } from "bun:test";
import {
  applyAttackModifier,
  applyDefenseModifier,
  getTacticModifiers,
  selectTactic,
} from "../../../src/simulation/match/tactics";

describe("selectTactic", () => {
  test("a big underdog sits DEFENSIVE", () => {
    expect(selectTactic(60, 80)).toBe("DEFENSIVE");
  });

  test("a big favourite goes ATTACKING", () => {
    expect(selectTactic(80, 60)).toBe("ATTACKING");
  });

  test("evenly matched sides stay BALANCED", () => {
    expect(selectTactic(75, 76)).toBe("BALANCED");
  });

  test("is symmetric at the threshold boundary", () => {
    expect(selectTactic(70, 76)).toBe("DEFENSIVE"); 
    expect(selectTactic(76, 70)).toBe("ATTACKING"); 
  });
});

describe("tactic modifiers", () => {
  test("ATTACKING boosts attack and weakens defense; DEFENSIVE is the mirror image", () => {
    const attacking = getTacticModifiers("ATTACKING");
    const defensive = getTacticModifiers("DEFENSIVE");

    expect(attacking.attack).toBeGreaterThan(0);
    expect(attacking.defense).toBeLessThan(0);
    expect(defensive.attack).toBeLessThan(0);
    expect(defensive.defense).toBeGreaterThan(0);
  });

  test("BALANCED changes nothing", () => {
    expect(applyAttackModifier(70, "BALANCED")).toBe(70);
    expect(applyDefenseModifier(70, "BALANCED")).toBe(70);
  });

  test("applyAttackModifier / applyDefenseModifier scale strength by the modifier", () => {
    const modifiers = getTacticModifiers("ATTACKING");
    expect(applyAttackModifier(70, "ATTACKING")).toBeCloseTo(70 * (1 + modifiers.attack));
    expect(applyDefenseModifier(70, "ATTACKING")).toBeCloseTo(70 * (1 + modifiers.defense));
  });
});
