// src/simulation/match/probability.ts
// Pure statistical model turning two strength numbers into a plausible
// scoreline's ingredients: possession -> shots -> shots on target -> goals.
// Each stage narrows down using the previous one, same as a real match builds.

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function calculatePossession(
  homeAttackStrength: number,
  awayAttackStrength: number,
): { home: number; away: number } {
  const total = homeAttackStrength + awayAttackStrength;

  if (total <= 0) {
    return { home: 50, away: 50 };
  }

  const home = clamp(Math.round((homeAttackStrength / total) * 100), 35, 65);

  return { home, away: 100 - home };
}

export function calculateShots(attackStrength: number, possession: number): number {
  const base = 5 + attackStrength / 15;
  const possessionBonus = (possession - 50) / 10;

  return clamp(Math.round(base + possessionBonus + random(-3, 3)), 1, 25);
}

export function calculateShotsOnTarget(shots: number, attackStrength: number): number {
  const accuracy = 0.25 + clamp(attackStrength, 40, 100) / 400;

  return clamp(Math.round(shots * (accuracy + random(-0.08, 0.08))), 0, shots);
}

export function calculateGoals(
  shotsOnTarget: number,
  attackStrength: number,
  defenseStrength: number,
): number {
  if (shotsOnTarget === 0) {
    return 0;
  }

  const strengthDifference = (attackStrength - defenseStrength) / 100;

  const conversionRate = clamp(
    0.18 + strengthDifference * 0.08 + random(-0.05, 0.05),
    0.05,
    0.45,
  );

  let goals = 0;

  for (let i = 0; i < shotsOnTarget; i++) {
    if (Math.random() < conversionRate) {
      goals++;
    }
  }

  return goals;
}
