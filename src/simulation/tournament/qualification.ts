import { seedBracket } from "./bracket";
import { runKnockoutBracket, type KnockoutParticipants } from "./knockout-stage";
import type { StrengthTeam } from "../match/team-strength";

export type ConfederationRegion =
  | "europe"
  | "africa"
  | "asia"
  | "south_america"
  | "north_america"
  | "oceania";

export interface RegionAllocation {
  direct: number;
  playoff: number;
}

export interface WorldCupQualificationConfig {
  allocation: Record<ConfederationRegion, RegionAllocation>;
  interConfederationFinalSlots: number;
}

export const WORLD_CUP_48_QUALIFICATION: WorldCupQualificationConfig = {
  allocation: {
    europe: { direct: 16, playoff: 0 },
    africa: { direct: 9, playoff: 1 },
    asia: { direct: 8, playoff: 1 },
    south_america: { direct: 6, playoff: 1 },
    north_america: { direct: 6, playoff: 2 },
    oceania: { direct: 1, playoff: 1 },
  },
  interConfederationFinalSlots: 2,
};


export const WORLD_CUP_32_QUALIFICATION: WorldCupQualificationConfig = {
  allocation: {
    europe: { direct: 14, playoff: 0 },
    africa: { direct: 5, playoff: 0 },
    asia: { direct: 4, playoff: 1 },
    south_america: { direct: 4, playoff: 1 },
    north_america: { direct: 3, playoff: 1 },
    oceania: { direct: 0, playoff: 1 },
  },
  interConfederationFinalSlots: 2,
};

export interface QualificationParticipants extends KnockoutParticipants {}

export function runInterConfederationPlayoff(
  contestants: StrengthTeam[],
  finalSlots: number,
  participants: QualificationParticipants,
): number[] {
  if (finalSlots <= 0 || contestants.length === 0) {
    return [];
  }

  const ranked = [...contestants].sort((a, b) => b.overall - a.overall);
  const paths: StrengthTeam[][] = Array.from({ length: finalSlots }, () => []);

  ranked.forEach((team, index) => {
    paths[index % finalSlots]!.push(team);
  });

  return paths
    .filter((path) => path.length > 0)
    .map((path) => {
      const seeded = seedBracket(path.map((team) => team.id));
      return runKnockoutBracket(seeded, participants).championTeamId;
    })
    .filter((teamId): teamId is number => teamId !== null);
}
