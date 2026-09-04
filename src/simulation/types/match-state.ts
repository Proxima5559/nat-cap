
import type { MatchEvent } from "./match-event";

export interface MatchState {
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  usedMinutes: Set<number>;
}

export function createMatchState(): MatchState {
  return {
    homeScore: 0,
    awayScore: 0,
    events: [],
    usedMinutes: new Set<number>(),
  };
}
