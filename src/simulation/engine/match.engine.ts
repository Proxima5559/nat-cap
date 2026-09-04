import { calculateTeamStrength, type StrengthPlayer, type StrengthTeam } from "../match/team-strength";
import { selectLineup, DEFAULT_FORMATION, type Formation } from "../match/lineup";
import { selectTactic, applyAttackModifier, applyDefenseModifier } from "../match/tactics";
import {
  calculateGoals,
  calculatePossession,
  calculateShots,
  calculateShotsOnTarget,
} from "../match/probability";
import { generateMatchEvents } from "../match/event-generator";
import type { MatchResult } from "../types/simulation-result";

export type { StrengthPlayer as MatchPlayer, StrengthTeam as MatchTeam };

export interface SimulateMatchInput {
  homeTeam: StrengthTeam;
  awayTeam: StrengthTeam;
  homePlayers: StrengthPlayer[];
  awayPlayers: StrengthPlayer[];
  formation?: Formation;
}

const HOME_ADVANTAGE = 2;

export class MatchEngine {
  simulate(input: SimulateMatchInput): MatchResult {
    const formation = input.formation ?? DEFAULT_FORMATION;

    const homeLineup = selectLineup(input.homePlayers, formation);
    const awayLineup = selectLineup(input.awayPlayers, formation);

    const homeBaseStrength = calculateTeamStrength(input.homeTeam, homeLineup.starters);
    const awayBaseStrength = calculateTeamStrength(input.awayTeam, awayLineup.starters);

    const homeTactic = selectTactic(homeBaseStrength, awayBaseStrength);
    const awayTactic = selectTactic(awayBaseStrength, homeBaseStrength);

    const homeAttack =
      applyAttackModifier(homeBaseStrength, homeTactic) + HOME_ADVANTAGE;
    const awayAttack = applyAttackModifier(awayBaseStrength, awayTactic);

    const homeDefense = applyDefenseModifier(homeBaseStrength, homeTactic);
    const awayDefense = applyDefenseModifier(awayBaseStrength, awayTactic);

    const possession = calculatePossession(homeAttack, awayAttack);

    const homeShots = calculateShots(homeAttack, possession.home);
    const awayShots = calculateShots(awayAttack, possession.away);

    const homeShotsOnTarget = calculateShotsOnTarget(homeShots, homeAttack);
    const awayShotsOnTarget = calculateShotsOnTarget(awayShots, awayAttack);

    const homeGoals = calculateGoals(homeShotsOnTarget, homeAttack, awayDefense);
    const awayGoals = calculateGoals(awayShotsOnTarget, awayAttack, homeDefense);

    const events = generateMatchEvents(
      { teamId: input.homeTeam.id, lineup: homeLineup, goals: homeGoals },
      { teamId: input.awayTeam.id, lineup: awayLineup, goals: awayGoals },
    );

    return {
      homeTeamId: input.homeTeam.id,
      awayTeamId: input.awayTeam.id,

      homeScore: homeGoals,
      awayScore: awayGoals,

      possession,
      shots: { home: homeShots, away: awayShots },
      shotsOnTarget: { home: homeShotsOnTarget, away: awayShotsOnTarget },

      events,
    };
  }
}

export const matchEngine = new MatchEngine();
