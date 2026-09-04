import { describe, expect, test } from "bun:test";
import {
  calculateGoals,
  calculatePossession,
  calculateShots,
  calculateShotsOnTarget,
} from "../../../src/simulation/match/probability";

describe("calculatePossession", () => {
  test("splits 50/50 for equal strength", () => {
    const { home, away } = calculatePossession(70, 70);
    expect(home).toBe(50);
    expect(away).toBe(50);
  });

  test("always sums to 100 and stays within the 35-65 clamp", () => {
    for (const [home, away] of [[100, 10], [10, 100], [50, 50], [0, 0]] as const) {
      const result = calculatePossession(home, away);
      expect(result.home + result.away).toBe(100);
      expect(result.home).toBeGreaterThanOrEqual(35);
      expect(result.home).toBeLessThanOrEqual(65);
    }
  });

  test("the stronger attack gets more of the ball", () => {
    const { home } = calculatePossession(90, 50);
    expect(home).toBeGreaterThan(50);
  });
});

describe("calculateShots", () => {
  test("always returns a value in [1, 25]", () => {
    for (let i = 0; i < 200; i++) {
      const shots = calculateShots(80, 60);
      expect(shots).toBeGreaterThanOrEqual(1);
      expect(shots).toBeLessThanOrEqual(25);
    }
  });

  test("a stronger attack with more possession averages more shots than a weak one", () => {
    const strongAvg = average(() => calculateShots(95, 60));
    const weakAvg = average(() => calculateShots(40, 40));

    expect(strongAvg).toBeGreaterThan(weakAvg);
  });
});

describe("calculateShotsOnTarget", () => {
  test("never exceeds the number of shots taken, never negative", () => {
    for (let i = 0; i < 200; i++) {
      const shots = 10;
      const onTarget = calculateShotsOnTarget(shots, 70);
      expect(onTarget).toBeGreaterThanOrEqual(0);
      expect(onTarget).toBeLessThanOrEqual(shots);
    }
  });

  test("zero shots means zero on target", () => {
    expect(calculateShotsOnTarget(0, 80)).toBe(0);
  });
});

describe("calculateGoals", () => {
  test("zero shots on target always means zero goals", () => {
    expect(calculateGoals(0, 90, 40)).toBe(0);
  });

  test("goals never exceed shots on target", () => {
    for (let i = 0; i < 200; i++) {
      const sot = 8;
      const goals = calculateGoals(sot, 75, 60);
      expect(goals).toBeGreaterThanOrEqual(0);
      expect(goals).toBeLessThanOrEqual(sot);
    }
  });

  test("a big attack-vs-defense mismatch converts more often on average", () => {
    const strongAvg = average(() => calculateGoals(10, 95, 30));
    const weakAvg = average(() => calculateGoals(10, 30, 95));

    expect(strongAvg).toBeGreaterThan(weakAvg);
  });
});

function average(fn: () => number, samples = 300): number {
  let total = 0;
  for (let i = 0; i < samples; i++) total += fn();
  return total / samples;
}
