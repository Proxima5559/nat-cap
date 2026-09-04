import { describe, expect, test } from "bun:test";
import { playerService, teamService } from "../../src/services";
import { uniqueName } from "./test-helpers";

describe("PlayerService", () => {
  test("createPlayer then getPlayerById round-trips the same data", async () => {
    const team = await teamService.createTeam({ name: uniqueName("Player Test FC"), overall: 70, region: "europe" });

    const player = await playerService.createPlayer({
      teamId: team.id,
      name: "Test Striker",
      position: "ST",
      ability: 85,
    });

    expect(player.id).toBeGreaterThan(0);

    const fetched = await playerService.getPlayerById(player.id);
    expect(fetched).toEqual(player);
  });

  test("getPlayerById returns null for a player that doesn't exist", async () => {
    expect(await playerService.getPlayerById(999_999)).toBeNull();
  });

  test("getPlayersByTeam only returns that team's players", async () => {
    const teamA = await teamService.createTeam({ name: uniqueName("Squad A"), overall: 70, region: "europe" });
    const teamB = await teamService.createTeam({ name: uniqueName("Squad B"), overall: 70, region: "europe" });

    await playerService.createPlayer({ teamId: teamA.id, name: "A Player", position: "GK", ability: 60 });
    await playerService.createPlayer({ teamId: teamB.id, name: "B Player", position: "GK", ability: 60 });

    const teamAPlayers = await playerService.getPlayersByTeam(teamA.id);
    expect(teamAPlayers.every((p) => p.teamId === teamA.id)).toBe(true);
    expect(teamAPlayers.some((p) => p.name === "A Player")).toBe(true);
    expect(teamAPlayers.some((p) => p.name === "B Player")).toBe(false);
  });

  test("updatePlayerAbility updates the ability and returns the updated player", async () => {
    const team = await teamService.createTeam({ name: uniqueName("Ability Test FC"), overall: 70, region: "asia" });
    const player = await playerService.createPlayer({
      teamId: team.id,
      name: "Improving Player",
      position: "CM",
      ability: 50,
    });

    const updated = await playerService.updatePlayerAbility(player.id, 75);
    expect(updated?.ability).toBe(75);

    const fetched = await playerService.getPlayerById(player.id);
    expect(fetched?.ability).toBe(75);
  });

  test("updatePlayerAbility rejects an out-of-range ability", async () => {
    const team = await teamService.createTeam({ name: uniqueName("Range Test FC"), overall: 70, region: "asia" });
    const player = await playerService.createPlayer({
      teamId: team.id,
      name: "Range Player",
      position: "CB",
      ability: 50,
    });

    await expect(playerService.updatePlayerAbility(player.id, 0)).rejects.toThrow();
    await expect(playerService.updatePlayerAbility(player.id, 101)).rejects.toThrow();
  });

  test("updatePlayerAbility returns null for a player that doesn't exist", async () => {
    expect(await playerService.updatePlayerAbility(999_999, 70)).toBeNull();
  });

  test("createPlayer rejects an unknown position", async () => {
    const team = await teamService.createTeam({ name: uniqueName("Bad Position FC"), overall: 70, region: "europe" });

    await expect(
      playerService.createPlayer({
        teamId: team.id,
        name: "Bad Player",
        // @ts-expect-error - deliberately invalid to exercise createPlayerDto validation
        position: "WIZARD",
        ability: 70,
      }),
    ).rejects.toThrow();
  });
});
