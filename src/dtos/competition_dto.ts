import { z } from "zod";

export const competitionTypeSchema = z.enum([
  "regional",
  "world",
]);

export const competitionRegionSchema = z.enum([
  "africa",
  "asia",
  "europe",
  "north_america",
  "south_america",
  "oceania",
  "world",
]);

export const createCompetitionDto = z.object({
  name: z.string().min(1).max(100),

  region: competitionRegionSchema,

  type: competitionTypeSchema,
});

export const competitionResponseDto = z.object({
  id: z.number().int(),

  name: z.string(),

  region: competitionRegionSchema,

  type: competitionTypeSchema,
});

export type CreateCompetitionInput =
  z.infer<typeof createCompetitionDto>;

export type CompetitionResponse =
  z.infer<typeof competitionResponseDto>;