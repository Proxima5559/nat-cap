import { competitionGenerator } from "../../generators/competition_generator";
import { tournamentGenerator } from "../../generators/tournament_generator";
import { tournamentEngine, type TournamentFormat } from "./tournament.engine";
import { rankTournamentParticipants } from "../tournament/ranking";
import {
  runInterConfederationPlayoff,
  WORLD_CUP_48_QUALIFICATION,
  type ConfederationRegion,
  type WorldCupQualificationConfig,
} from "../tournament/qualification";
import type { StrengthPlayer, StrengthTeam } from "../match/team-strength";
import type { CycleResult, RegionalResult } from "../types/simulation-result";

export interface RegionEntry {
  region: ConfederationRegion;
  teams: StrengthTeam[];
}

export interface CycleEngineInput {
  seed: number;
  regions: RegionEntry[];
  playersByTeam: Map<number, StrengthPlayer[]>;
  regionalFormat?: TournamentFormat;
  qualification?: WorldCupQualificationConfig;
  worldCupFormat?: { groupCount?: number; qualifiersPerGroup?: number };
}

const DEFAULT_REGIONAL_FORMAT: TournamentFormat = {
  kind: "GROUP_KNOCKOUT",
  groupCount: 4,
  qualifiersPerGroup: 2,
};


function pickRegionalFormat(teamCount: number): TournamentFormat {
  if (teamCount < 4) {
    return { kind: "KNOCKOUT" };
  }

  if (teamCount < 8) {
    return { kind: "ROUND_ROBIN" };
  }

  const groupCount = Math.min(8, Math.max(2, Math.floor(teamCount / 4)));

  return { kind: "GROUP_KNOCKOUT", groupCount, qualifiersPerGroup: 2 };
}

export class CycleEngine {
  run(input: CycleEngineInput): CycleResult {
    const qualification = input.qualification ?? WORLD_CUP_48_QUALIFICATION;

    const teamsById = new Map<number, StrengthTeam>();
    for (const region of input.regions) {
      for (const team of region.teams) {
        teamsById.set(team.id, team);
      }
    }

    const regionalResults: RegionalResult[] = input.regions
      .filter((region) => region.teams.length >= 2)
      .map((region) => {
        const competition = competitionGenerator.generate(region.region);
        const tournamentMeta = tournamentGenerator.generate(competition.name);

        const tournament = tournamentEngine.run({
          name: tournamentMeta.name,
          teams: region.teams,
          playersByTeam: input.playersByTeam,
          format: input.regionalFormat ?? pickRegionalFormat(region.teams.length),
        });

        const allocation = qualification.allocation[region.region] ?? {
          direct: 0,
          playoff: 0,
        };

        const ranked = rankTournamentParticipants(
          tournament,
          region.teams.map((team) => team.id),
        );

        return {
          region: region.region,
          competitionName: competition.name,
          tournament,
          directQualifierTeamIds: ranked.slice(0, allocation.direct),
          playoffContestantTeamIds: ranked.slice(
            allocation.direct,
            allocation.direct + allocation.playoff,
          ),
        };
      });

    const playoffContestants = regionalResults
      .flatMap((result) => result.playoffContestantTeamIds)
      .map((teamId) => teamsById.get(teamId))
      .filter((team): team is StrengthTeam => team !== undefined);

    const playoffQualifierIds = runInterConfederationPlayoff(
      playoffContestants,
      qualification.interConfederationFinalSlots,
      { teamsById, playersByTeam: input.playersByTeam },
    );

    const interConfederationPlayoff =
      playoffContestants.length > 0
        ? {
            contestantTeamIds: playoffContestants.map((team) => team.id),
            qualifiedTeamIds: playoffQualifierIds,
          }
        : null;

    const worldCupTeamIds = [
      ...regionalResults.flatMap((result) => result.directQualifierTeamIds),
      ...playoffQualifierIds,
    ];

    const worldCupTeams = worldCupTeamIds
      .map((teamId) => teamsById.get(teamId))
      .filter((team): team is StrengthTeam => team !== undefined);

    let world = null;

    if (worldCupTeams.length >= 2) {
      const groupCount =
        input.worldCupFormat?.groupCount ?? Math.max(1, Math.floor(worldCupTeams.length / 4));

      world = tournamentEngine.run({
        name: "World Cup",
        teams: worldCupTeams,
        playersByTeam: input.playersByTeam,
        format: {
          kind: "GROUP_KNOCKOUT",
          groupCount,
          qualifiersPerGroup: input.worldCupFormat?.qualifiersPerGroup ?? 2,
        },
      });
    }

    return {
      seed: input.seed,
      regionalResults,
      interConfederationPlayoff,
      world,
    };
  }
}

export const cycleEngine = new CycleEngine();
