import { describe, expect, test } from "bun:test";
import { createPlayerDto } from "../../src/dtos";

describe("createPlayerDto", () => {
  test("accepts a valid player", () => {
    const result = createPlayerDto.safeParse({ teamId: 1, name: "Rossi", position: "ST", ability: 80 });
    expect(result.success).toBe(true);
  });

  test("rejects a non-positive teamId", () => {
    expect(createPlayerDto.safeParse({ teamId: 0, name: "X", position: "ST", ability: 80 }).success).toBe(false);
    expect(createPlayerDto.safeParse({ teamId: -1, name: "X", position: "ST", ability: 80 }).success).toBe(false);
  });

  test("rejects an unknown position", () => {
    expect(createPlayerDto.safeParse({ teamId: 1, name: "X", position: "WIZARD", ability: 80 }).success).toBe(false);
  });

  test("rejects ability outside 1-100", () => {
    expect(createPlayerDto.safeParse({ teamId: 1, name: "X", position: "ST", ability: 0 }).success).toBe(false);
    expect(createPlayerDto.safeParse({ teamId: 1, name: "X", position: "ST", ability: 101 }).success).toBe(false);
  });

  test("rejects a name over 100 characters", () => {
    const longName = "a".repeat(101);
    expect(createPlayerDto.safeParse({ teamId: 1, name: longName, position: "ST", ability: 80 }).success).toBe(false);
  });
});
