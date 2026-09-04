import { z } from "zod";

export const tournamentStatusSchema = z.enum([
  "created",
  "running",
  "completed",
]);

export const createTournamentDto = z.object({
  cycleId: z.number().int().positive(),

  competitionId: z.number().int().positive(),

  name: z.string().min(1).max(150),
});

export const tournamentResponseDto = z.object({
  id: z.number().int(),

  cycleId: z.number().int(),

  competitionId: z.number().int(),

  name: z.string(),

  status: tournamentStatusSchema,

  startedAt: z.date().nullable(),

  completedAt: z.date().nullable(),
});

export type CreateTournamentInput =
  z.infer<typeof createTournamentDto>;

export type TournamentResponse =
  z.infer<typeof tournamentResponseDto>;