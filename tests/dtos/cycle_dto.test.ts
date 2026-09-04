import { describe, expect, test } from "bun:test";
import { createCycleDto } from "../../src/dtos";

describe("createCycleDto", () => {
  test("accepts an integer seed", () => {
    expect(createCycleDto.safeParse({ seed: 42 }).success).toBe(true);
  });

  test("rejects a non-integer seed", () => {
    expect(createCycleDto.safeParse({ seed: 42.5 }).success).toBe(false);
  });

  test("rejects a missing seed", () => {
    expect(createCycleDto.safeParse({}).success).toBe(false);
  });
});
