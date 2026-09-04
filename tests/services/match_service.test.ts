import { describe, expect, test } from "bun:test";
import {
  competitionService,
  cycleService,
  matchService,
  teamService,
  tournamentService,
} from "../../src/services";
import { uniqueName } from "./test-helpers";

async function makeTournamentWithTwoTeams() {
  const cycle = await cycleService.createCycle({ seed: Math.floor(Date.now() + Math.random() * 1000) });
  const competition = await competitionService.createCompetition({
    name: uniqueName("Match Test Championship"),
    region: "europe",
    type: "regional",
  });
  const tournament = await tournamentService.createTournament({
    cycleId: cycle.id,
    competitionId: competition.id,
    name: uniqueName("Match Test Cup"),
  });
  const home = await teamService.createTeam({ name: uniqueName("Home FC"), overall: 70, region: "europe" });
  const away = await teamService.createTeam({ name: uniqueName("Away FC"), overall: 70, region: "europe" });

  return { tournament, home, away };
}

describe("MatchService", () => {
  test("createMatch starts a match 'scheduled' with null scores", async () => {
    const { tournament, home, away } = await makeTournamentWithTwoTeams();

    const match = await matchService.createMatch({
      tournamentId: tournament.id,
      homeTeamId: home.id,
      awayTeamId: away.id,
    });

    expect(match.status).toBe("scheduled");
    expect(match.homeScore).toBeNull();
    expect(match.awayScore).toBeNull();

    const fetched = await matchService.getMatchById(match.id);
    expect(fetched).toEqual(match);
  });

  test("createMatch rejects a team playing itself", async () => {
    const { tournament, home } = await makeTournamentWithTwoTeams();

    await expect(
      matchService.createMatch({
        tournamentId: tournament.id,
        homeTeamId: home.id,
        awayTeamId: home.id,
      }),
    ).rejects.toThrow();
  });

  test("getMatchesByTournament and getMatchesByTeam filter correctly", async () => {
    const { tournament, home, away } = await makeTournamentWithTwoTeams();
    const match = await matchService.createMatch({
      tournamentId: tournament.id,
      homeTeamId: home.id,
      awayTeamId: away.id,
    });

    const byTournament = await matchService.getMatchesByTournament(tournament.id);
    expect(byTournament.some((m) => m.id === match.id)).toBe(true);

    const byHomeTeam = await matchService.getMatchesByTeam(home.id);
    expect(byHomeTeam.some((m) => m.id === match.id)).toBe(true);

    const byAwayTeam = await matchService.getMatchesByTeam(away.id);
    expect(byAwayTeam.some((m) => m.id === match.id)).toBe(true);
  });

  test("startMatch moves status to 'live'", async () => {
    const { tournament, home, away } = await makeTournamentWithTwoTeams();
    const match = await matchService.createMatch({
      tournamentId: tournament.id,
      homeTeamId: home.id,
      awayTeamId: away.id,
    });

    const started = await matchService.startMatch(match.id);
    expect(started?.status).toBe("live");
  });

  test("completeMatch sets the final score, status, and playedAt", async () => {
    const { tournament, home, away } = await makeTournamentWithTwoTeams();
    const match = await matchService.createMatch({
      tournamentId: tournament.id,
      homeTeamId: home.id,
      awayTeamId: away.id,
    });

    const completed = await matchService.completeMatch(match.id, 3, 1);

    expect(completed?.status).toBe("completed");
    expect(completed?.homeScore).toBe(3);
    expect(completed?.awayScore).toBe(1);
    expect(completed?.playedAt).not.toBeNull();
  });

  test("completeMatch rejects negative or non-integer scores", async () => {
    const { tournament, home, away } = await makeTournamentWithTwoTeams();
    const match = await matchService.createMatch({
      tournamentId: tournament.id,
      homeTeamId: home.id,
      awayTeamId: away.id,
    });

    await expect(matchService.completeMatch(match.id, -1, 0)).rejects.toThrow();
    await expect(matchService.completeMatch(match.id, 1.5, 0)).rejects.toThrow();
  });

  test("getMatchEvents returns an empty list for a match with none recorded", async () => {
    const { tournament, home, away } = await makeTournamentWithTwoTeams();
    const match = await matchService.createMatch({
      tournamentId: tournament.id,
      homeTeamId: home.id,
      awayTeamId: away.id,
    });

    expect(await matchService.getMatchEvents(match.id)).toEqual([]);
  });

  test("getMatchById returns null for a match that doesn't exist", async () => {
    expect(await matchService.getMatchById(999_999)).toBeNull();
  });
});
