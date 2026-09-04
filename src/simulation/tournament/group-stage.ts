import { fixtureGenerator, type Fixture } from "../../generators/fixture_generator";
import { matchEngine } from "../engine/match.engine";
import { buildStandings } from "./standings";
import type { StrengthPlayer, StrengthTeam } from "../match/team-strength";
import type { GroupStageGroupResult, GroupStageResult, MatchResult } from "../types/simulation-result";

export interface GroupStageParticipants {
  teamsById: Map<number, StrengthTeam>;
  playersByTeam: Map<number, StrengthPlayer[]>;
}

function simulateFixture(
  fixture: Fixture,
  participants: GroupStageParticipants,
): MatchResult | null {
  if (fixture.awayTeamId === null) {
    return null;
  }

  const homeTeam = participants.teamsById.get(fixture.homeTeamId);
  const awayTeam = participants.teamsById.get(fixture.awayTeamId);

  if (!homeTeam || !awayTeam) {
    throw new Error(
      `Group fixture references unknown team(s): ${fixture.homeTeamId} vs ${fixture.awayTeamId}`,
    );
  }

  return matchEngine.simulate({
    homeTeam,
    awayTeam,
    homePlayers: participants.playersByTeam.get(homeTeam.id) ?? [],
    awayPlayers: participants.playersByTeam.get(awayTeam.id) ?? [],
  });
}

export interface RunGroupStageOptions {
  groupCount: number;
  qualifiersPerGroup: number;
  legs?: 1 | 2;
}

export function runGroupStage(
  teamIds: number[],
  participants: GroupStageParticipants,
  options: RunGroupStageOptions,
): GroupStageResult {
  const fixtures = fixtureGenerator.generateGroupStage(
    teamIds,
    options.groupCount,
    options.legs ?? 1,
  );

  const fixturesByGroup = new Map<string, Fixture[]>();

  for (const fixture of fixtures) {
    const groupName = fixture.group ?? "A";
    const list = fixturesByGroup.get(groupName) ?? [];

    list.push(fixture);
    fixturesByGroup.set(groupName, list);
  }

  const groups: GroupStageGroupResult[] = [];
  const winners: number[] = [];
  const runnersUp: number[] = [];
  const rest: number[] = [];

  for (const [groupName, groupFixtures] of [...fixturesByGroup.entries()].sort(
    ([a], [b]) => a.localeCompare(b),
  )) {
    const groupTeamIds = [
      ...new Set(
        groupFixtures.flatMap((fixture) =>
          fixture.awayTeamId === null
            ? [fixture.homeTeamId]
            : [fixture.homeTeamId, fixture.awayTeamId],
        ),
      ),
    ];

    const matches = groupFixtures
      .map((fixture) => simulateFixture(fixture, participants))
      .filter((match): match is MatchResult => match !== null);

    const standings = buildStandings(groupTeamIds, matches);

    standings.forEach((row, index) => {
      if (index === 0) {
        winners.push(row.teamId);
      } else if (index === 1) {
        runnersUp.push(row.teamId);
      } else if (index < options.qualifiersPerGroup) {
        rest.push(row.teamId);
      }
    });

    groups.push({ group: groupName, standings, matches });
  }

  return {
    groups,
    qualifiedTeamIds: [...winners, ...runnersUp, ...rest],
  };
}
