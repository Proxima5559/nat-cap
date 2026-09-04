export function seedBracket(rankedTeamIds: number[]): number[] {
  const teamCount = rankedTeamIds.length;
  const seeded: number[] = [];

  const pairCount = Math.floor(teamCount / 2);

  for (let i = 0; i < pairCount; i++) {
    seeded.push(rankedTeamIds[i]!, rankedTeamIds[teamCount - 1 - i]!);
  }

  if (teamCount % 2 !== 0) {
    seeded.push(rankedTeamIds[pairCount]!);
  }

  return seeded;
}
