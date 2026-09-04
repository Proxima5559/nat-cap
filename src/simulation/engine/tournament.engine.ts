// src/simulation/engine/tournament.engine.ts
// Runs an entire tournament: teams -> fixtures -> MatchEngine -> standings
// -> qualified teams -> next round -> winner.

import { fixtureGenerator } from "../../generators/fixture_generator";
import { matchEngine } from "./match.engine";
import { runGroupStage, type GroupStageParticipants } from "../tournament/group-stage";
import { runKnockoutBracket } from "../tournament/knockout-stage";
import { seedBracket } from "../tournament/bracket";
import { buildStandings } from "../tournament/standings";
import type { StrengthPlayer, StrengthTeam } from "../match/team-strength";
import type { MatchResult, TournamentResult } from "../types/simulation-result";

export type TournamentFormat =
  | { kind: "ROUND_ROBIN"; legs?: 1 | 2 }
  | { kind: "GROUP_KNOCKOUT"; groupCount: number; qualifiersPerGroup: number; legs?: 1 | 2 }
  | { kind: "KNOCKOUT" };

export interface TournamentEngineInput {
  name: string;
  teams: StrengthTeam[];
  playersByTeam: Map<number, StrengthPlayer[]>;
  format: TournamentFormat;
}

function rankByOverall(teams: StrengthTeam[]): number[] {
  return [...teams].sort((a, b) => b.overall - a.overall).map((team) => team.id);
}

export class TournamentEngine {
  run(input: TournamentEngineInput): TournamentResult {
    const teamsById = new Map(input.teams.map((team) => [team.id, team]));
    const teamIds = input.teams.map((team) => team.id);
    const participants: GroupStageParticipants = {
      teamsById,
      playersByTeam: input.playersByTeam,
    };

    if (input.format.kind === "ROUND_ROBIN") {
      const fixtures = fixtureGenerator.generateRoundRobin(teamIds, {
        legs: input.format.legs ?? 1,
      });

      const allMatches: MatchResult[] = [];

      for (const fixture of fixtures) {
        if (fixture.awayTeamId === null) {
          continue;
        }

        const homeTeam = teamsById.get(fixture.homeTeamId);
        const awayTeam = teamsById.get(fixture.awayTeamId);

        if (!homeTeam || !awayTeam) {
          continue;
        }

        allMatches.push(
          matchEngine.simulate({
            homeTeam,
            awayTeam,
            homePlayers: input.playersByTeam.get(homeTeam.id) ?? [],
            awayPlayers: input.playersByTeam.get(awayTeam.id) ?? [],
          }),
        );
      }

      const standings = buildStandings(teamIds, allMatches);

      return {
        name: input.name,
        format: "ROUND_ROBIN",
        groupStage: {
          groups: [{ group: "main", standings, matches: allMatches }],
          qualifiedTeamIds: standings.map((row) => row.teamId),
        },
        knockoutStage: null,
        allMatches,
        championTeamId: standings[0]?.teamId ?? null,
      };
    }

    if (input.format.kind === "GROUP_KNOCKOUT") {
      const groupStage = runGroupStage(teamIds, participants, {
        groupCount: input.format.groupCount,
        qualifiersPerGroup: input.format.qualifiersPerGroup,
        legs: input.format.legs,
      });

      const seeded = seedBracket(groupStage.qualifiedTeamIds);
      const knockoutStage = runKnockoutBracket(seeded, participants);

      const allMatches = [
        ...groupStage.groups.flatMap((group) => group.matches),
        ...knockoutStage.rounds.flatMap((round) => round.matches),
      ];

      return {
        name: input.name,
        format: "GROUP_KNOCKOUT",
        groupStage,
        knockoutStage,
        allMatches,
        championTeamId: knockoutStage.championTeamId,
      };
    }

    const seeded = seedBracket(rankByOverall(input.teams));
    const knockoutStage = runKnockoutBracket(seeded, participants);

    return {
      name: input.name,
      format: "KNOCKOUT",
      groupStage: null,
      knockoutStage,
      allMatches: knockoutStage.rounds.flatMap((round) => round.matches),
      championTeamId: knockoutStage.championTeamId,
    };
  }
}

export const tournamentEngine = new TournamentEngine();
