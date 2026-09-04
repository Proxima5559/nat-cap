import type { MatchEvent } from "../types/match-event";
import { generateGoalEvents } from "./goal-simulator";
import type { StrengthPlayer } from "./team-strength";
import type { Lineup } from "./lineup";

const CARD_PRONE_POSITIONS = ["CB", "LCB", "RCB", "LB", "RB", "CDM", "DM"];
const RED_CARD_CHANCE = 0.08;
const MAX_YELLOW_CARDS = 4;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickWeightedByPosition(
  players: StrengthPlayer[],
  preferredPositions: string[] = [],
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

function generateCardEvents(
  teamId: number,
  lineup: StrengthPlayer[],
  usedMinutes: Set<number>,
): MatchEvent[] {
  const events: MatchEvent[] = [];
  const yellowCount = randomInt(0, MAX_YELLOW_CARDS);
  const carded = new Set<number>();

  for (let i = 0; i < yellowCount; i++) {
    const player = pickWeightedByPosition(lineup, CARD_PRONE_POSITIONS);

    if (!player || carded.has(player.id)) {
      continue;
    }

    carded.add(player.id);

    events.push({
      minute: nextFreeMinute(usedMinutes, 10, 90),
      type: "YELLOW_CARD",
      teamId,
      playerId: player.id,
    });
  }

  if (Math.random() < RED_CARD_CHANCE) {
    const player = pickWeightedByPosition(lineup);

    if (player) {
      events.push({
        minute: nextFreeMinute(usedMinutes, 20, 90),
        type: "RED_CARD",
        teamId,
        playerId: player.id,
      });
    }
  }

  return events;
}

function generateSubstitutionEvents(
  teamId: number,
  lineup: Lineup,
  usedMinutes: Set<number>,
): MatchEvent[] {
  if (lineup.bench.length === 0) {
    return [];
  }

  const subCount = Math.min(3, lineup.bench.length, lineup.starters.length);
  const events: MatchEvent[] = [];

  const goingOff = [...lineup.starters]
    .sort((a, b) => a.ability - b.ability)
    .slice(0, subCount);

  const comingOn = [...lineup.bench]
    .sort((a, b) => b.ability - a.ability)
    .slice(0, subCount);

  for (let i = 0; i < subCount; i++) {
    const off = goingOff[i];
    const on = comingOn[i];

    if (!off || !on) {
      continue;
    }

    events.push({
      minute: nextFreeMinute(usedMinutes, 46, 90),
      type: "SUBSTITUTION",
      teamId,
      playerId: off.id,
      secondaryPlayerId: on.id,
    });
  }

  return events;
}

export interface EventGeneratorTeamInput {
  teamId: number;
  lineup: Lineup;
  goals: number;
}

export function generateMatchEvents(
  home: EventGeneratorTeamInput,
  away: EventGeneratorTeamInput,
): MatchEvent[] {
  const usedMinutes = new Set<number>();

  const events: MatchEvent[] = [
    ...generateGoalEvents(home.teamId, home.lineup.starters, home.goals, usedMinutes),
    ...generateGoalEvents(away.teamId, away.lineup.starters, away.goals, usedMinutes),
    ...generateCardEvents(home.teamId, home.lineup.starters, usedMinutes),
    ...generateCardEvents(away.teamId, away.lineup.starters, usedMinutes),
    ...generateSubstitutionEvents(home.teamId, home.lineup, usedMinutes),
    ...generateSubstitutionEvents(away.teamId, away.lineup, usedMinutes),
  ];

  return events.sort((a, b) => a.minute - b.minute);
}
