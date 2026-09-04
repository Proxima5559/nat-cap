import { describe, expect, test } from "bun:test";
import { createTeamDto } from "../../src/dtos";

describe("createTeamDto", () => {
  test("accepts a valid team", () => {
    const result = createTeamDto.safeParse({ name: "River Plate", overall: 80, region: "south_america" });
    expect(result.success).toBe(true);
  });

  test("rejects an empty name", () => {
    expect(createTeamDto.safeParse({ name: "", overall: 80, region: "europe" }).success).toBe(false);
  });

  test("rejects overall outside 1-100", () => {
    expect(createTeamDto.safeParse({ name: "X", overall: 0, region: "europe" }).success).toBe(false);
    expect(createTeamDto.safeParse({ name: "X", overall: 101, region: "europe" }).success).toBe(false);
  });

  test("rejects a non-integer overall", () => {
    expect(createTeamDto.safeParse({ name: "X", overall: 75.5, region: "europe" }).success).toBe(false);
  });

  test("rejects an unknown region", () => {
    expect(createTeamDto.safeParse({ name: "X", overall: 75, region: "atlantis" }).success).toBe(false);
  });

  test("rejects a missing field", () => {
    expect(createTeamDto.safeParse({ name: "X", region: "europe" }).success).toBe(false);
  });
});
