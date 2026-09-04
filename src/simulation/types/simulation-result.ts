import type { MatchEvent } from "./match-event";

export interface TeamMatchStats {
  home: number;
  away: number;
}

export interface MatchResult {
  homeTeamId: number;
  awayTeamId: number;

  homeScore: number;
  awayScore: number;

  possession: TeamMatchStats;
  shots: TeamMatchStats;
  shotsOnTarget: TeamMatchStats;

  events: MatchEvent[];

  isBye?: boolean;
  wentToPenalties?: boolean;
  penaltyScore?: TeamMatchStats;
}

export interface KnockoutMatchResult extends MatchResult {
  winnerTeamId: number;
}

export interface StandingsRow {
  teamId: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface GroupStageGroupResult {
  group: string;
  standings: StandingsRow[];
  matches: MatchResult[];
}

export interface GroupStageResult {
  groups: GroupStageGroupResult[];
  qualifiedTeamIds: number[];
}

export interface KnockoutRoundResult {
  round: number;
  matches: KnockoutMatchResult[];
}

export interface KnockoutStageResult {
  rounds: KnockoutRoundResult[];
  championTeamId: number | null;
}

export type TournamentFormatKind = "ROUND_ROBIN" | "GROUP_KNOCKOUT" | "KNOCKOUT";

export interface TournamentResult {
  name: string;
  format: TournamentFormatKind;
  groupStage: GroupStageResult | null;
  knockoutStage: KnockoutStageResult | null;
  allMatches: MatchResult[];
  championTeamId: number | null;
}

export interface RegionalResult {
  region: string;
  competitionName: string;
  tournament: TournamentResult;
  directQualifierTeamIds: number[];
  playoffContestantTeamIds: number[];
}

export interface InterConfederationPlayoffResult {
  contestantTeamIds: number[];
  qualifiedTeamIds: number[];
}

export interface CycleResult {
  seed: number;
  regionalResults: RegionalResult[];
  interConfederationPlayoff: InterConfederationPlayoffResult | null;
  world: TournamentResult | null;
}
