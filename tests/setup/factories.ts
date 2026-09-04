
import type { StrengthPlayer, StrengthTeam } from "../../src/simulation/match/team-strength";

const POSITIONS = [
  "GK", "GK", "CB", "CB", "LB", "RB", "CDM", "CM", "CM", "LM", "RM", "ST", "ST", "CAM", "LW", "RW",
];

let nextTeamId = 1;
let nextPlayerId = 1;

export function resetFactoryIds(): void {
  nextTeamId = 1;
  nextPlayerId = 1;
}

export function makeTeam(overall = 70, name?: string): StrengthTeam {
  const id = nextTeamId++;
  return { id, name: name ?? `Team ${id}`, overall };
}

export function makeSquad(teamId: number, overall = 70): StrengthPlayer[] {
  return POSITIONS.map((position) => ({
    id: nextPlayerId++,
    teamId,
    name: `Player ${nextPlayerId}`,
    position,
    ability: overall,
  }));
}

export function makeTeamsAndPlayers(
  count: number,
  overall = 70,
): { teams: StrengthTeam[]; teamsById: Map<number, StrengthTeam>; playersByTeam: Map<number, StrengthPlayer[]> } {
  const teams = Array.from({ length: count }, () => makeTeam(overall));
  const teamsById = new Map(teams.map((team) => [team.id, team]));
  const playersByTeam = new Map(teams.map((team) => [team.id, makeSquad(team.id, overall)]));

  return { teams, teamsById, playersByTeam };
}
