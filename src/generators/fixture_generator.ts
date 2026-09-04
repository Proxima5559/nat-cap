export type MatchType =
  | "GROUP"
  | "ROUND_ROBIN"
  | "KNOCKOUT";

export interface Fixture {
  homeTeamId: number;
  awayTeamId: number | null;
  round: number;
  leg: number;
  group?: string;
  type: MatchType;
}

export class FixtureGenerator {
  private shuffle<T>(array: T[]): T[] {
    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    }

    return arr;
  }

  generate(teamIds: number[]): Fixture[] {
    if (teamIds.length === 0) {
      return [];
    }

    const shuffled = this.shuffle(teamIds);
    const fixtures: Fixture[] = [];

    for (let i = 0; i < shuffled.length; i += 2) {
      const homeTeamId = shuffled[i]!;
      const awayTeamId = shuffled[i + 1] ?? null;

      fixtures.push({
        homeTeamId,
        awayTeamId,
        round: 1,
        leg: 1,
        type: "ROUND_ROBIN",
      });
    }

    return fixtures;
  }

  generateGroupStage(
    teamIds: number[],
    groupCount: number,
    legs: 1 | 2 = 1,
  ): Fixture[] {
    if (
      groupCount <= 0 ||
      // Every group needs at least 2 teams to produce a single fixture —
      // `< groupCount` alone would silently allow 1-team groups that
      // generateRoundRobin() then quietly drops (it returns [] below 2
      // teams), losing those teams from the tournament without any error.
      teamIds.length < groupCount * 2
    ) {
      return [];
    }

    const shuffled = this.shuffle(teamIds);

    const groups: number[][] = Array.from(
      { length: groupCount },
      () => [],
    );

    shuffled.forEach((teamId, index) => {
      const groupIndex = index % groupCount;

      groups[groupIndex]!.push(teamId);
    });

    const fixtures: Fixture[] = [];

    groups.forEach((groupTeams, index) => {
      const groupName = String.fromCharCode(
        "A".charCodeAt(0) + index,
      );

      fixtures.push(
        ...this.generateRoundRobin(groupTeams, {
          legs,
          group: groupName,
          type: "GROUP",
        }),
      );
    });

    return fixtures;
  }

  generateRoundRobin(
    teamIds: number[],
    options?: {
      legs?: 1 | 2;
      group?: string;
      type?: MatchType;
    },
  ): Fixture[] {
    if (teamIds.length < 2) {
      return [];
    }

    const legs = options?.legs ?? 1;
    const group = options?.group;
    const type = options?.type ?? "ROUND_ROBIN";

    const list: (number | null)[] = [
      ...teamIds,
    ];

    if (list.length % 2 !== 0) {
      list.push(null);
    }

    const teamCount = list.length;
    const rounds = teamCount - 1;
    const matchesPerRound = teamCount / 2;

    const fixtures: Fixture[] = [];

    for (let round = 0; round < rounds; round++) {
      for (let i = 0; i < matchesPerRound; i++) {
        const home = list[i]!;
        const away = list[teamCount - 1 - i]!;

        if (home === null && away === null) {
          continue;
        }

        if (home === null || away === null) {
          const realTeam = home ?? away!;

          fixtures.push({
            homeTeamId: realTeam,
            awayTeamId: null,
            round: round + 1,
            leg: 1,
            group,
            type,
          });

          if (legs === 2) {
            fixtures.push({
              homeTeamId: realTeam,
              awayTeamId: null,
              round: round + 1 + rounds,
              leg: 2,
              group,
              type,
            });
          }

          continue;
        }

        fixtures.push({
          homeTeamId: home,
          awayTeamId: away,
          round: round + 1,
          leg: 1,
          group,
          type,
        });


        if (legs === 2) {
          fixtures.push({
            homeTeamId: away,
            awayTeamId: home,
            round: round + 1 + rounds,
            leg: 2,
            group,
            type,
          });
        }
      }


      const fixed = list[0]!;
      const rest = list.slice(1);

      rest.unshift(rest.pop()!);

      list[0] = fixed;
      list.splice(1, rest.length, ...rest);
    }

    return fixtures;
  }

  generateKnockoutRound(
    teamIds: number[],
    roundNumber: number = 1,
  ): Fixture[] {
    if (teamIds.length === 0) {
      return [];
    }

    const fixtures: Fixture[] = [];
    const list = [...teamIds];

    if (list.length % 2 !== 0) {
      const luckyTeam = list.shift()!;

      fixtures.push({
        homeTeamId: luckyTeam,
        awayTeamId: null,
        round: roundNumber,
        leg: 1,
        type: "KNOCKOUT",
      });
    }


    for (let i = 0; i < list.length; i += 2) {
      fixtures.push({
        homeTeamId: list[i]!,
        awayTeamId: list[i + 1]!,
        round: roundNumber,
        leg: 1,
        type: "KNOCKOUT",
      });
    }

    return fixtures;
  }
}

export const fixtureGenerator =
  new FixtureGenerator();