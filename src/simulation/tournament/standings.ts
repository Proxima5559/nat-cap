import type { MatchResult, StandingsRow } from "../types/simulation-result";

const POINTS_FOR_WIN = 3;
const POINTS_FOR_DRAW = 1;

function createEmptyRow(teamId: number): StandingsRow {
  return {
    teamId,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  };
}

function applyResult(row: StandingsRow, goalsFor: number, goalsAgainst: number): void {
  row.played += 1;
  row.goalsFor += goalsFor;
  row.goalsAgainst += goalsAgainst;
  row.goalDifference = row.goalsFor - row.goalsAgainst;

  if (goalsFor > goalsAgainst) {
    row.wins += 1;
    row.points += POINTS_FOR_WIN;
  } else if (goalsFor === goalsAgainst) {
    row.draws += 1;
    row.points += POINTS_FOR_DRAW;
  } else {
    row.losses += 1;
  }
}

function sortStandings(rows: StandingsRow[]): StandingsRow[] {
  return [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamId - b.teamId;
  });
}


export function buildStandings(teamIds: number[], matches: MatchResult[]): StandingsRow[] {
  const rows = new Map<number, StandingsRow>(
    teamIds.map((teamId) => [teamId, createEmptyRow(teamId)]),
  );

  for (const match of matches) {
    if (match.isBye) {
      continue;
    }

    const homeRow = rows.get(match.homeTeamId);
    const awayRow = rows.get(match.awayTeamId);

    if (homeRow) {
      applyResult(homeRow, match.homeScore, match.awayScore);
    }

    if (awayRow) {
      applyResult(awayRow, match.awayScore, match.homeScore);
    }
  }

  return sortStandings([...rows.values()]);
}
