import type { TournamentResult } from "../types/simulation-result";

export function rankTournamentParticipants(
  tournament: TournamentResult,
  allTeamIds: number[],
): number[] {
  const ranked: number[] = [];
  const seen = new Set<number>();

  const add = (teamId: number) => {
    if (!seen.has(teamId)) {
      ranked.push(teamId);
      seen.add(teamId);
    }
  };

  if (tournament.knockoutStage) {
    if (tournament.championTeamId !== null) {
      add(tournament.championTeamId);
    }

    for (let i = tournament.knockoutStage.rounds.length - 1; i >= 0; i--) {
      const round = tournament.knockoutStage.rounds[i]!;

      for (const match of round.matches) {
        if (match.isBye) {
          continue;
        }

        const loser =
          match.winnerTeamId === match.homeTeamId ? match.awayTeamId : match.homeTeamId;

        add(loser);
      }
    }
  }

  if (tournament.groupStage) {
    const remaining = tournament.groupStage.groups
      .flatMap((group) => group.standings)
      .filter((row) => !seen.has(row.teamId))
      .sort(
        (a, b) =>
          b.points - a.points ||
          b.goalDifference - a.goalDifference ||
          b.goalsFor - a.goalsFor,
      );

    for (const row of remaining) {
      add(row.teamId);
    }
  }

  for (const teamId of allTeamIds) {
    add(teamId);
  }

  return ranked;
}
