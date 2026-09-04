export interface GeneratedCycle {
  seed: number;
}

export class CycleGenerator {
  generate(seed?: number): GeneratedCycle {
    return {
      seed: seed ?? Math.floor(Math.random() * 2_147_483_647),
    };
  }
}

export const cycleGenerator = new CycleGenerator();