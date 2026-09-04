import { describe, expect, test } from "bun:test";
import {
  competitionService,
  cycleService,
  playerService,
  statisticsService,
  teamService,
  tournamentService,
} from "../../src/services";
import { uniqueName } from "./test-helpers";

async function makeCycleAndPlayer() {
  const cycle = await cycleService.createCycle({ seed: Math.floor(Date.now() + Math.random() * 1000) });
  const team = await teamService.createTeam({ name: uniqueName("Stats FC"), overall: 70, region: "europe" });
  const player = await playerService.createPlayer({
    teamId: team.id,
    name: "Stats Player",
    position: "ST",
    ability: 80,
  });

  return { cycle, team, player };
}

describe("StatisticsService", () => {
  test("createPlayerStatistics starts every counter at 0 with a null averageRating", async () => {
    const { cycle, player } = await makeCycleAndPlayer();

    const stats = await statisticsService.createPlayerStatistics(cycle.id, player.id);

    expect(stats.playerId).toBe(player.id);
    expect(stats).toMatchObject({
      appearances: 0,
      starts: 0,
      minutes: 0,
      goals: 0,
      assists: 0,
      shots: 0,
      shotsOnTarget: 0,
      yellowCards: 0,
      redCards: 0,
      averageRating: null,
    });
  });

  test("getPlayerStatistics returns null when nothing has been recorded yet", async () => {
    const { cycle, player } = await makeCycleAndPlayer();
    expect(await statisticsService.getPlayerStatistics(cycle.id, player.id)).toBeNull();
  });

  test("updatePlayerStatistics applies a partial update and getPlayerStatistics reflects it", async () => {
    const { cycle, player } = await makeCycleAndPlayer();
    await statisticsService.createPlayerStatistics(cycle.id, player.id);

    const updated = await statisticsService.updatePlayerStatistics(cycle.id, player.id, {
      goals: 5,
      assists: 2,
      averageRating: 7.8,
    });

    expect(updated).toMatchObject({ goals: 5, assists: 2, averageRating: 7.8 });

    const fetched = await statisticsService.getPlayerStatistics(cycle.id, player.id);
    expect(fetched).toMatchObject({ goals: 5, assists: 2, averageRating: 7.8 });
  });

  test("updatePlayerStatistics returns null for a (cycle, player) pair with no row", async () => {
    const { cycle, player } = await makeCycleAndPlayer();
    // No createPlayerStatistics call first.
    expect(await statisticsService.updatePlayerStatistics(cycle.id, player.id, { goals: 1 })).toBeNull();
  });

  test("getPlayerStatisticsByCycle and getPlayerStatisticsByPlayer both find the row", async () => {
    const { cycle, player } = await makeCycleAndPlayer();
    await statisticsService.createPlayerStatistics(cycle.id, player.id);

    const byCycle = await statisticsService.getPlayerStatisticsByCycle(cycle.id);
    expect(byCycle.some((s) => s.playerId === player.id)).toBe(true);

    const byPlayer = await statisticsService.getPlayerStatisticsByPlayer(player.id);
    expect(byPlayer.some((s) => s.playerId === player.id)).toBe(true);
  });

  test("getPlayerStatisticsByTeam only returns players from that team in that cycle", async () => {
    const cycle = await cycleService.createCycle({ seed: Math.floor(Date.now() + Math.random() * 1000) });
    const teamA = await teamService.createTeam({ name: uniqueName("Stats Team A"), overall: 70, region: "europe" });
    const teamB = await teamService.createTeam({ name: uniqueName("Stats Team B"), overall: 70, region: "europe" });
    const playerA = await playerService.createPlayer({ teamId: teamA.id, name: "A", position: "ST", ability: 70 });
    const playerB = await playerService.createPlayer({ teamId: teamB.id, name: "B", position: "ST", ability: 70 });

    await statisticsService.createPlayerStatistics(cycle.id, playerA.id);
    await statisticsService.createPlayerStatistics(cycle.id, playerB.id);

    const teamAStats = await statisticsService.getPlayerStatisticsByTeam(cycle.id, teamA.id);
    expect(teamAStats.some((s) => s.playerId === playerA.id)).toBe(true);
    expect(teamAStats.some((s) => s.playerId === playerB.id)).toBe(false);
  });

  test("creating statistics twice for the same (cycle, player) violates the unique index", async () => {
    const { cycle, player } = await makeCycleAndPlayer();
    await statisticsService.createPlayerStatistics(cycle.id, player.id);

    await expect(statisticsService.createPlayerStatistics(cycle.id, player.id)).rejects.toThrow();
  });
});
