export type Tactic = "DEFENSIVE" | "BALANCED" | "ATTACKING";

export interface TacticModifiers {
  attack: number;
  defense: number;
  possession: number;
}

const TACTIC_MODIFIERS: Record<Tactic, TacticModifiers> = {
  DEFENSIVE: { attack: -0.08, defense: 0.1, possession: -3 },
  BALANCED: { attack: 0, defense: 0, possession: 0 },
  ATTACKING: { attack: 0.1, defense: -0.08, possession: 3 },
};

const UNDERDOG_THRESHOLD = 6;
const FAVOURITE_THRESHOLD = 6;

export function selectTactic(teamStrength: number, opponentStrength: number): Tactic {
  const diff = teamStrength - opponentStrength;

  if (diff <= -UNDERDOG_THRESHOLD) {
    return "DEFENSIVE";
  }

  if (diff >= FAVOURITE_THRESHOLD) {
    return "ATTACKING";
  }

  return "BALANCED";
}

export function getTacticModifiers(tactic: Tactic): TacticModifiers {
  return TACTIC_MODIFIERS[tactic];
}

export function applyAttackModifier(strength: number, tactic: Tactic): number {
  return strength * (1 + TACTIC_MODIFIERS[tactic].attack);
}

export function applyDefenseModifier(strength: number, tactic: Tactic): number {
  return strength * (1 + TACTIC_MODIFIERS[tactic].defense);
}
