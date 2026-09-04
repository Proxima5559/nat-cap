import { describe, expect, test } from "bun:test";
import { routes } from "../../src/routes";

describe("competition routes", () => {
  test("POST /competitions creates a competition, GET /competitions/:id fetches it back", async () => {
    const createResponse = await routes.handle(
      new Request("http://localhost/competitions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: `Route Test Cup ${Date.now()}`, region: "europe", type: "regional" }),
      }),
    );

    expect(createResponse.status).toBe(201);
    const created = await createResponse.json();
    expect(created.id).toBeGreaterThan(0);

    const getResponse = await routes.handle(
      new Request(`http://localhost/competitions/${created.id}`),
    );

    expect(getResponse.status).toBe(200);
    expect(await getResponse.json()).toEqual(created);
  });

  test("GET /competitions/:id returns 404 for a competition that doesn't exist", async () => {
    const response = await routes.handle(new Request("http://localhost/competitions/999999"));

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("NotFound");
  });

  test("POST /competitions with invalid data (zod) returns 400", async () => {
    const response = await routes.handle(
      new Request("http://localhost/competitions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "", region: "europe", type: "regional" }),
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("ValidationError");
  });

  test("GET /competitions/region/:region only returns that region's competitions", async () => {
    const name = `Region Route Test ${Date.now()}`;
    await routes.handle(
      new Request("http://localhost/competitions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, region: "oceania", type: "regional" }),
      }),
    );

    const response = await routes.handle(new Request("http://localhost/competitions/region/oceania"));
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.some((c: { name: string }) => c.name === name)).toBe(true);
    expect(body.every((c: { region: string }) => c.region === "oceania")).toBe(true);
  });
});
