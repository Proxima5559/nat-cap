import { describe, expect, test } from "bun:test";
import { cycleService } from "../../src/services";

describe("CycleService", () => {
  test("createCycle starts a cycle in 'created' status with no completedAt", async () => {
    const cycle = await cycleService.createCycle({ seed: 12345 });

    expect(cycle.seed).toBe(12345);
    expect(cycle.status).toBe("created");
    expect(cycle.completedAt).toBeNull();
  });

  test("getCycleById returns null for a cycle that doesn't exist", async () => {
    expect(await cycleService.getCycleById(999_999)).toBeNull();
  });

  test("startCycle moves status to 'running'", async () => {
    const cycle = await cycleService.createCycle({ seed: Date.now() });
    const started = await cycleService.startCycle(cycle.id);

    expect(started?.status).toBe("running");
  });

  test("completeCycle moves status to 'completed' and sets completedAt", async () => {
    const cycle = await cycleService.createCycle({ seed: Date.now() });
    await cycleService.startCycle(cycle.id);
    const completed = await cycleService.completeCycle(cycle.id);

    expect(completed?.status).toBe("completed");
    expect(completed?.completedAt).not.toBeNull();
  });

  test("failCycle moves status to 'failed'", async () => {
    const cycle = await cycleService.createCycle({ seed: Date.now() });
    const failed = await cycleService.failCycle(cycle.id);

    expect(failed?.status).toBe("failed");
  });

  test("startCycle / completeCycle / failCycle return null for a cycle that doesn't exist", async () => {
    expect(await cycleService.startCycle(999_999)).toBeNull();
    expect(await cycleService.completeCycle(999_999)).toBeNull();
    expect(await cycleService.failCycle(999_999)).toBeNull();
  });

  test("createCycle rejects a non-integer seed", async () => {
    await expect(cycleService.createCycle({ seed: 1.5 })).rejects.toThrow();
  });
});
