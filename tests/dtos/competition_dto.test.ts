import { describe, expect, test } from "bun:test";
import { createCompetitionDto } from "../../src/dtos";

describe("createCompetitionDto", () => {
  test("accepts a valid competition", () => {
    expect(
      createCompetitionDto.safeParse({ name: "Euro Cup", region: "europe", type: "regional" }).success,
    ).toBe(true);
  });

  test("accepts the 'world' region for global competitions", () => {
    expect(
      createCompetitionDto.safeParse({ name: "World Cup", region: "world", type: "world" }).success,
    ).toBe(true);
  });

  test("rejects an unknown type", () => {
    expect(
      createCompetitionDto.safeParse({ name: "X", region: "europe", type: "continental" }).success,
    ).toBe(false);
  });

  test("rejects a name over 100 characters", () => {
    expect(
      createCompetitionDto.safeParse({ name: "a".repeat(101), region: "europe", type: "regional" }).success,
    ).toBe(false);
  });
});
