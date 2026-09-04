import { z } from "zod";

export const playerStatisticsDto = z.object({
  playerId: z.number().int(),

  appearances: z.number().int().min(0),

  starts: z.number().int().min(0),

  minutes: z.number().int().min(0),

  goals: z.number().int().min(0),

  assists: z.number().int().min(0),

  shots: z.number().int().min(0),

  shotsOnTarget: z.number().int().min(0),

  yellowCards: z.number().int().min(0),

  redCards: z.number().int().min(0),

  averageRating: z.number().min(0).max(10).nullable(),
});

export const teamStatisticsDto = z.object({
  teamId: z.number().int(),

  matches: z.number().int().min(0),

  wins: z.number().int().min(0),

  draws: z.number().int().min(0),

  losses: z.number().int().min(0),

  goalsFor: z.number().int().min(0),

  goalsAgainst: z.number().int().min(0),

  averagePossession: z.number().min(0).max(100).nullable(),
});

export type PlayerStatistics = z.infer<typeof playerStatisticsDto>;

export type TeamStatistics = z.infer<typeof teamStatisticsDto>;