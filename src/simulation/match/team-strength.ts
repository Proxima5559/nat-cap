
export interface StrengthTeam {
  id: number;
  name: string;
  overall: number;
}

export interface StrengthPlayer {
  id: number;
  teamId: number;
  name: string;
  position: string;
  ability: number;
}

export function calculateTeamStrength(
  team: StrengthTeam,
  startingLineup: StrengthPlayer[],
): number {
  if (startingLineup.length === 0) {
    return team.overall;
  }

  const lineupAverage =
    startingLineup.reduce((total, player) => total + player.ability, 0) /
    startingLineup.length;

  return (team.overall + lineupAverage) / 2;
}
