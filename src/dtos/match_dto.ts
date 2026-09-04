import { z } from "zod";

export const matchStatusSchema = z.enum([
  "scheduled",
  "live",
  "completed",
]);

export const createMatchDto = z.object({
  tournamentId: z.number().int().positive(),

  homeTeamId: z.number().int().positive(),

  awayTeamId: z.number().int().positive(),
});

export const matchScoreSchema = z.object({
  home: z.number().int().min(0),

  away: z.number().int().min(0),
});

export const matchResponseDto = z.object({
  id: z.number().int(),

  tournamentId: z.number().int(),

  homeTeamId: z.number().int(),

  awayTeamId: z.number().int(),

  homeScore: z.number().int().min(0).nullable(),

  awayScore: z.number().int().min(0).nullable(),

  status: matchStatusSchema,

  playedAt: z.coerce.date().nullable(),
});

export type CreateMatchInput = z.infer<typeof createMatchDto>;

export type MatchResponse = z.infer<typeof matchResponseDto>;