import { describe, expect, test } from "bun:test";
import { routes } from "../../src/routes";

describe("team routes", () => {
  test("POST /teams creates a team, GET /teams/:id fetches it back", async () => {
    const createResponse = await routes.handle(
      new Request("http://localhost/teams", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: `Route Test FC ${Date.now()}`, overall: 75, region: "europe" }),
      }),
    );

    expect(createResponse.status).toBe(201);
    const team = await createResponse.json();

    const getResponse = await routes.handle(new Request(`http://localhost/teams/${team.id}`));
    expect(getResponse.status).toBe(200);
    expect(await getResponse.json()).toEqual(team);
  });

  test("GET /teams/:id/players returns an empty list for a team with no players yet", async () => {
    const createResponse = await routes.handle(
      new Request("http://localhost/teams", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: `Empty Squad FC ${Date.now()}`, overall: 60, region: "asia" }),
      }),
    );
    const team = await createResponse.json();

    const response = await routes.handle(new Request(`http://localhost/teams/${team.id}/players`));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
  });

  test("GET /teams/:id returns 404 for a team that doesn't exist", async () => {
    const response = await routes.handle(new Request("http://localhost/teams/999999"));
    expect(response.status).toBe(404);
  });
});

describe("player routes", () => {
  test("POST /players creates a player under a team", async () => {
    const teamResponse = await routes.handle(
      new Request("http://localhost/teams", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: `Player Route FC ${Date.now()}`, overall: 70, region: "africa" }),
      }),
    );
    const team = await teamResponse.json();

    const playerResponse = await routes.handle(
      new Request("http://localhost/players", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teamId: team.id, name: "Route Test Player", position: "ST", ability: 80 }),
      }),
    );

    expect(playerResponse.status).toBe(201);
    const player = await playerResponse.json();
    expect(player.teamId).toBe(team.id);
  });

  test("PATCH /players/:id/ability updates ability, rejects out-of-range values", async () => {
    const teamResponse = await routes.handle(
      new Request("http://localhost/teams", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: `Ability Route FC ${Date.now()}`, overall: 70, region: "africa" }),
      }),
    );
    const team = await teamResponse.json();

    const playerResponse = await routes.handle(
      new Request("http://localhost/players", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teamId: team.id, name: "Ability Player", position: "CM", ability: 50 }),
      }),
    );
    const player = await playerResponse.json();

    const okResponse = await routes.handle(
      new Request(`http://localhost/players/${player.id}/ability`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ability: 90 }),
      }),
    );
    expect(okResponse.status).toBe(200);
    expect((await okResponse.json()).ability).toBe(90);

    const badResponse = await routes.handle(
      new Request(`http://localhost/players/${player.id}/ability`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ability: 500 }),
      }),
    );
    expect(badResponse.status).toBe(400);
  });
});
