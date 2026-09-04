import { describe, expect, test } from "bun:test";
import { calculateTeamStrength, type StrengthPlayer, type StrengthTeam } from "../../../src/simulation/match/team-strength";

const team: StrengthTeam = { id: 1, name: "Test FC", overall: 80 };

function makePlayer(ability: number): StrengthPlayer {
  return { id: Math.random(), teamId: 1, name: "p", position: "ST", ability };
}

describe("calculateTeamStrength", () => {
  test("falls back to the team's own overall with an empty lineup", () => {
    expect(calculateTeamStrength(team, [])).toBe(80);
  });

  test("blends team overall with the lineup's average ability", () => {
    const lineup = [makePlayer(60), makePlayer(70)]; 
    expect(calculateTeamStrength(team, lineup)).toBe((80 + 65) / 2);
  });

  test("a stronger lineup pulls strength up, a weaker one pulls it down", () => {
    const strong = calculateTeamStrength(team, [makePlayer(95), makePlayer(95)]);
    const weak = calculateTeamStrength(team, [makePlayer(30), makePlayer(30)]);

    expect(strong).toBeGreaterThan(80);
    expect(weak).toBeLessThan(80);
  });
});
