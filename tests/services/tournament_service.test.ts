import { describe, expect, test } from "bun:test";
import { competitionService, cycleService, teamService, tournamentService } from "../../src/services";
import { uniqueName } from "./test-helpers";

async function makeCycleAndCompetition(region: "europe" | "asia" | "africa" = "europe") {
  const cycle = await cycleService.createCycle({ seed: Math.floor(Date.now() + Math.random() * 1000) });
  const competition = await competitionService.createCompetition({
    name: uniqueName("Tournament Test Championship"),
    region,
    type: "regional",
  });

  return { cycle, competition };
}

describe("TournamentService", () => {
  test("createTournament then getTournamentById round-trips, status starts 'created'", async () => {
    const { cycle, competition } = await makeCycleAndCompetition();

    const tournament = await tournamentService.createTournament({
      cycleId: cycle.id,
      competitionId: competition.id,
      name: uniqueName("Test Cup"),
    });

    expect(tournament.status).toBe("created");
    expect(tournament.startedAt).toBeNull();

    const fetched = await tournamentService.getTournamentById(tournament.id);
    expect(fetched).toEqual(tournament);
  });

  test("getTournamentById returns null for a tournament that doesn't exist", async () => {
    expect(await tournamentService.getTournamentById(999_999)).toBeNull();
  });

  test("getTournamentsByCycle and getTournamentsByCompetition filter correctly", async () => {
    const { cycle, competition } = await makeCycleAndCompetition("asia");
    const tournament = await tournamentService.createTournament({
      cycleId: cycle.id,
      competitionId: competition.id,
      name: uniqueName("Filter Cup"),
    });

    const byCycle = await tournamentService.getTournamentsByCycle(cycle.id);
    expect(byCycle.some((t) => t.id === tournament.id)).toBe(true);

    const byCompetition = await tournamentService.getTournamentsByCompetition(competition.id);
    expect(byCompetition.some((t) => t.id === tournament.id)).toBe(true);
  });

  test("addTeamToTournament / getTournamentTeams / removeTeamFromTournament", async () => {
    const { cycle, competition } = await makeCycleAndCompetition("africa");
    const tournament = await tournamentService.createTournament({
      cycleId: cycle.id,
      competitionId: competition.id,
      name: uniqueName("Roster Cup"),
    });
    const team = await teamService.createTeam({ name: uniqueName("Roster FC"), overall: 70, region: "africa" });

    await tournamentService.addTeamToTournament(tournament.id, team.id);

    const rosterTeams = await tournamentService.getTournamentTeams(tournament.id);
    expect(rosterTeams.some((row) => row.teamId === team.id)).toBe(true);

    await tournamentService.removeTeamFromTournament(tournament.id, team.id);

    const afterRemoval = await tournamentService.getTournamentTeams(tournament.id);
    expect(afterRemoval.some((row) => row.teamId === team.id)).toBe(false);
  });

  test("addTeamToTournament rejects a duplicate registration", async () => {
    const { cycle, competition } = await makeCycleAndCompetition();
    const tournament = await tournamentService.createTournament({
      cycleId: cycle.id,
      competitionId: competition.id,
      name: uniqueName("Dupe Roster Cup"),
    });
    const team = await teamService.createTeam({ name: uniqueName("Dupe Roster FC"), overall: 70, region: "europe" });

    await tournamentService.addTeamToTournament(tournament.id, team.id);
    await expect(tournamentService.addTeamToTournament(tournament.id, team.id)).rejects.toThrow();
  });

  test("getTournamentDetails bundles the tournament with its registered teams", async () => {
    const { cycle, competition } = await makeCycleAndCompetition();
    const tournament = await tournamentService.createTournament({
      cycleId: cycle.id,
      competitionId: competition.id,
      name: uniqueName("Details Cup"),
    });
    const team = await teamService.createTeam({ name: uniqueName("Details FC"), overall: 70, region: "europe" });
    await tournamentService.addTeamToTournament(tournament.id, team.id);

    const details = await tournamentService.getTournamentDetails(tournament.id);

    expect(details?.tournament.id).toBe(tournament.id);
    expect(details?.teams.some((row) => row.teamId === team.id)).toBe(true);
  });

  test("getTournamentDetails returns null for a tournament that doesn't exist", async () => {
    expect(await tournamentService.getTournamentDetails(999_999)).toBeNull();
  });

  test("startTournament / completeTournament update status and timestamps", async () => {
    const { cycle, competition } = await makeCycleAndCompetition();
    const tournament = await tournamentService.createTournament({
      cycleId: cycle.id,
      competitionId: competition.id,
      name: uniqueName("Lifecycle Cup"),
    });

    const started = await tournamentService.startTournament(tournament.id);
    expect(started?.status).toBe("running");
    expect(started?.startedAt).not.toBeNull();

    const completed = await tournamentService.completeTournament(tournament.id);
    expect(completed?.status).toBe("completed");
    expect(completed?.completedAt).not.toBeNull();
  });

  test("createTournament rejects a non-positive foreign key", async () => {
    await expect(
      tournamentService.createTournament({ cycleId: 0, competitionId: 1, name: "Bad Cup" }),
    ).rejects.toThrow();
  });
});
