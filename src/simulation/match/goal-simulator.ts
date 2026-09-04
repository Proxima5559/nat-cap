// src/simulation/match/goal-simulator.ts

import type { MatchEvent } from "../types/match-event";
import type { StrengthPlayer } from "./team-strength";

const SCORER_POSITIONS = ["ST", "CF", "LW", "RW", "CAM", "SS"];
const ASSISTER_POSITIONS = ["CAM", "CM", "LCM", "RCM", "LM", "RM", "LW", "RW"];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickWeightedByPosition(
  players: StrengthPlayer[],
  preferredPositions: string[],
): StrengthPlayer | null {
  if (players.length === 0) {
    return null;
  }

  const preferred = players.filter((player) =>
    preferredPositions.includes(player.position),
  );

  const pool = preferred.length > 0 ? preferred : players;

  return pool[randomInt(0, pool.length - 1)] ?? null;
}

function nextFreeMinute(usedMinutes: Set<number>, min: number, max: number): number {
  let minute = randomInt(min, max);
  let attempts = 0;

  while (usedMinutes.has(minute) && attempts < 200) {
    minute = randomInt(min, max);
    attempts++;
  }

  usedMinutes.add(minute);
  return minute;
}

export function generateGoalEvents(
  teamId: number,
  lineup: StrengthPlayer[],
  goals: number,
  usedMinutes: Set<number>,
): MatchEvent[] {
  const events: MatchEvent[] = [];

  for (let i = 0; i < goals; i++) {
    const minute = nextFreeMinute(usedMinutes, 1, 90);
    const scorer = pickWeightedByPosition(lineup, SCORER_POSITIONS);

    if (!scorer) {
      continue;
    }

    const assister = pickWeightedByPosition(
      lineup.filter((player) => player.id !== scorer.id),
      ASSISTER_POSITIONS,
    );

    events.push({
      minute,
      type: "GOAL",
      teamId,
      playerId: scorer.id,
      ...(assister ? { secondaryPlayerId: assister.id } : {}),
    });
  }

  return events;
}
