import { fixtureGenerator, type Fixture } from "../../generators/fixture_generator";
import { matchEngine } from "../engine/match.engine";
import type { StrengthPlayer, StrengthTeam } from "../match/team-strength";
import type { KnockoutMatchResult, KnockoutRoundResult } from "../types/simulation-result";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function simulatePenaltyShootout(
  homeStrength: number,
  awayStrength: number,
): { winner: "home" | "away"; score: { home: number; away: number } } {
  const homeWinChance = clamp(0.5 + (homeStrength - awayStrength) * 0.002, 0.35, 0.65);

  let home = 0;
  let away = 0;

  for (let round = 0; round < 5; round++) {
    if (Math.random() < 0.75) home++;
    if (Math.random() < 0.75) away++;
  }

  while (home === away) {
    if (Math.random() < homeWinChance) {
      home++;
    } else {
      away++;
    }
  }

  return {
    winner: home > away ? "home" : "away",
    score: { home, away },
  };
}

export interface KnockoutParticipants {
  teamsById: Map<number, StrengthTeam>;
  playersByTeam: Map<number, StrengthPlayer[]>;
}

function simulateKnockoutFixture(
  fixture: Fixture,
  participants: KnockoutParticipants,
): KnockoutMatchResult {
  if (fixture.awayTeamId === null) {
    return {
      homeTeamId: fixture.homeTeamId,
      awayTeamId: fixture.homeTeamId,
      homeScore: 0,
      awayScore: 0,
      possession: { home: 0, away: 0 },
      shots: { home: 0, away: 0 },
      shotsOnTarget: { home: 0, away: 0 },
      events: [],
      isBye: true,
      winnerTeamId: fixture.homeTeamId,
    };
  }

  const homeTeam = participants.teamsById.get(fixture.homeTeamId);
  const awayTeam = participants.teamsById.get(fixture.awayTeamId);

  if (!homeTeam || !awayTeam) {
    throw new Error(
      `Knockout fixture references unknown team(s): ${fixture.homeTeamId} vs ${fixture.awayTeamId}`,
    );
  }

  const result = matchEngine.simulate({
    homeTeam,
    awayTeam,
    homePlayers: participants.playersByTeam.get(homeTeam.id) ?? [],
    awayPlayers: participants.playersByTeam.get(awayTeam.id) ?? [],
  });

  if (result.homeScore !== result.awayScore) {
    return {
      ...result,
      winnerTeamId: result.homeScore > result.awayScore ? homeTeam.id : awayTeam.id,
    };
  }

  const shootout = simulatePenaltyShootout(homeTeam.overall, awayTeam.overall);

  return {
    ...result,
    wentToPenalties: true,
    penaltyScore: shootout.score,
    winnerTeamId: shootout.winner === "home" ? homeTeam.id : awayTeam.id,
  };
}

function simulateKnockoutRound(
  teamIds: number[],
  round: number,
  participants: KnockoutParticipants,
): KnockoutRoundResult {
  const fixtures = fixtureGenerator.generateKnockoutRound(teamIds, round);

  return {
    round,
    matches: fixtures.map((fixture) => simulateKnockoutFixture(fixture, participants)),
  };
}

export interface KnockoutBracketResult {
  rounds: KnockoutRoundResult[];
  championTeamId: number | null;
}


export function runKnockoutBracket(
  seededTeamIds: number[],
  participants: KnockoutParticipants,
  startRound = 1,
): KnockoutBracketResult {
  if (seededTeamIds.length === 0) {
    return { rounds: [], championTeamId: null };
  }

  if (seededTeamIds.length === 1) {
    return { rounds: [], championTeamId: seededTeamIds[0]! };
  }

  const rounds: KnockoutRoundResult[] = [];
  let currentTeamIds = seededTeamIds;
  let round = startRound;

  while (currentTeamIds.length > 1) {
    const roundResult = simulateKnockoutRound(currentTeamIds, round, participants);

    rounds.push(roundResult);
    currentTeamIds = roundResult.matches.map((match) => match.winnerTeamId);
    round++;
  }

  return {
    rounds,
    championTeamId: currentTeamIds[0] ?? null,
  };
}
