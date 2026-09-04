import { describe, expect, test } from "bun:test";
import { teamService } from "../../src/services";
import { uniqueName } from "./test-helpers";

describe("TeamService", () => {
  test("createTeam then getTeamById round-trips the same data", async () => {
    const team = await teamService.createTeam({
      name: uniqueName("Boca"),
      overall: 82,
      region: "south_america",
    });

    expect(team.id).toBeGreaterThan(0);

    const fetched = await teamService.getTeamById(team.id);
    expect(fetched).toEqual(team);
  });

  test("getTeamById returns null for a team that doesn't exist", async () => {
    expect(await teamService.getTeamById(999_999)).toBeNull();
  });

  test("getTeamsByRegion only returns teams from that region", async () => {
    const name = uniqueName("Oceania FC");
    await teamService.createTeam({ name, overall: 60, region: "oceania" });

    const results = await teamService.getTeamsByRegion("oceania");
    expect(results.some((t) => t.name === name)).toBe(true);
    expect(results.every((t) => t.region === "oceania")).toBe(true);
  });

  test("addTeamToTournament then getTeamTournaments shows the link, removing it clears it", async () => {
    const { competitionService, cycleService, tournamentService } = await import("../../src/services");

    const team = await teamService.createTeam({ name: uniqueName("Linked FC"), overall: 70, region: "asia" });
    const cycle = await cycleService.createCycle({ seed: Date.now() });
    const competition = await competitionService.createCompetition({
      name: uniqueName("Test Championship"),
      region: "asia",
      type: "regional",
    });
    const tournament = await tournamentService.createTournament({
      cycleId: cycle.id,
      competitionId: competition.id,
      name: uniqueName("Test Tournament"),
    });

    await teamService.addTeamToTournament(team.id, tournament.id);

    const linked = await teamService.getTeamTournaments(team.id);
    expect(linked.some((row) => row.tournamentId === tournament.id)).toBe(true);

    await teamService.removeTeamFromTournament(team.id, tournament.id);

    const afterRemoval = await teamService.getTeamTournaments(team.id);
    expect(afterRemoval.some((row) => row.tournamentId === tournament.id)).toBe(false);
  });

  test("addTeamToTournament rejects registering the same team twice", async () => {
    const { competitionService, cycleService, tournamentService } = await import("../../src/services");

    const team = await teamService.createTeam({ name: uniqueName("Dupe FC"), overall: 70, region: "africa" });
    const cycle = await cycleService.createCycle({ seed: Date.now() });
    const competition = await competitionService.createCompetition({
      name: uniqueName("Dupe Championship"),
      region: "africa",
      type: "regional",
    });
    const tournament = await tournamentService.createTournament({
      cycleId: cycle.id,
      competitionId: competition.id,
      name: uniqueName("Dupe Tournament"),
    });

    await teamService.addTeamToTournament(team.id, tournament.id);

    await expect(teamService.addTeamToTournament(team.id, tournament.id)).rejects.toThrow();
  });

 test("createTeam rejects invalid input", async () => {
    await expect(
      teamService.createTeam({
        name: "", 
        overall: 70,
        region: "europe",
      }),
    ).rejects.toThrow();
  });
});
