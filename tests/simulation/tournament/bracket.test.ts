import { describe, expect, test } from "bun:test";
import { seedBracket } from "../../../src/simulation/tournament/bracket";

describe("seedBracket", () => {
  test("pairs 1st vs last, 2nd vs 2nd-last, etc. (even count)", () => {
    expect(seedBracket([1, 2, 3, 4])).toEqual([1, 4, 2, 3]);
  });

  test("the odd one out (weakest unpaired) goes last", () => {
    expect(seedBracket([1, 2, 3, 4, 5])).toEqual([1, 5, 2, 4, 3]);
  });

  test("preserves every input team exactly once", () => {
    const input = [10, 20, 30, 40, 50, 60, 70];
    const result = seedBracket(input);

    expect(result).toHaveLength(input.length);
    expect(new Set(result)).toEqual(new Set(input));
  });

  test("handles a single team", () => {
    expect(seedBracket([1])).toEqual([1]);
  });

  test("handles an empty list", () => {
    expect(seedBracket([])).toEqual([]);
  });
});
