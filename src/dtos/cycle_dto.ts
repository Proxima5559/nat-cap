import { z } from "zod";

export const cycleStatusSchema = z.enum([
  "created",
  "running",
  "completed",
  "failed",
]);

export const createCycleDto = z.object({
  seed: z.number().int(),
});

export const cycleResponseDto = z.object({
  id: z.number().int(),
  seed: z.number().int(),
  status: cycleStatusSchema,
  createdAt: z.date(),
  completedAt: z.date().nullable(),
});

export type CreateCycleInput = z.infer<typeof createCycleDto>;
export type CycleResponse = z.infer<typeof cycleResponseDto>;