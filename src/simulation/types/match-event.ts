
export const MATCH_EVENT_TYPES = [
  "GOAL",
  "YELLOW_CARD",
  "RED_CARD",
  "SUBSTITUTION",
] as const;

export type MatchEventType = (typeof MATCH_EVENT_TYPES)[number];

export interface MatchEvent {
  minute: number;
  type: MatchEventType;
  teamId: number;
  playerId: number;
  secondaryPlayerId?: number;
}
