import { beforeEach, describe, expect, test } from "bun:test";
import { matchEngine } from "../../../src/simulation/engine/match.engine";
import { makeSquad, makeTeam, resetFactoryIds } from "../../setup/factories";

beforeEach(() => resetFactoryIds());

describe("MatchEngine.simulate", () => {
  test("returns a plausible, internally consistent result", () => {
    const homeTeam = makeTeam(75);
    const awayTeam = makeTeam(65);
    const homePlayers = makeSquad(homeTeam.id, 75);
    const awayPlayers = makeSquad(awayTeam.id, 65);

    const result = matchEngine.simulate({ homeTeam, awayTeam, homePlayers, awayPlayers });

    expect(result.homeTeamId).toBe(homeTeam.id);
    expect(result.awayTeamId).toBe(awayTeam.id);
    expect(result.homeScore).toBeGreaterThanOrEqual(0);
    expect(result.awayScore).toBeGreaterThanOrEqual(0);
    expect(result.possession.home + result.possession.away).toBe(100);
    expect(result.shotsOnTarget.home).toBeLessThanOrEqual(result.shots.home);
    expect(result.shotsOnTarget.away).toBeLessThanOrEqual(result.shots.away);

    const goalEvents = result.events.filter((e) => e.type === "GOAL");
    expect(goalEvents.filter((e) => e.teamId === homeTeam.id)).toHaveLength(result.homeScore);
    expect(goalEvents.filter((e) => e.teamId === awayTeam.id)).toHaveLength(result.awayScore);
  });

  test("copes with an empty squad on one side without throwing", () => {
    const homeTeam = makeTeam(70);
    const awayTeam = makeTeam(70);

    const result = matchEngine.simulate({
      homeTeam,
      awayTeam,
      homePlayers: makeSquad(homeTeam.id),
      awayPlayers: [],
    });

    expect(result.awayScore).toBeGreaterThanOrEqual(0);
  });

  test("a much stronger home side wins more often than not over many simulations", () => {
    const strongTeam = makeTeam(95);
    const weakTeam = makeTeam(35);
    const strongPlayers = makeSquad(strongTeam.id, 95);
    const weakPlayers = makeSquad(weakTeam.id, 35);

    let strongWins = 0;
    const samples = 60;

    for (let i = 0; i < samples; i++) {
      const result = matchEngine.simulate({
        homeTeam: strongTeam,
        awayTeam: weakTeam,
        homePlayers: strongPlayers,
        awayPlayers: weakPlayers,
      });

      if (result.homeScore > result.awayScore) strongWins++;
    }

    expect(strongWins).toBeGreaterThan(samples * 0.6);
  });
});
