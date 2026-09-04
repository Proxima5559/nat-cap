import { z } from "zod";

export const teamRegionSchema = z.enum([
  "africa",
  "asia",
  "europe",
  "north_america",
  "south_america",
  "oceania",
]);

export const createTeamDto = z.object({
  name: z.string().min(1).max(100),
  overall: z.number().int().min(1).max(100),
  region: teamRegionSchema,
});

export const teamResponseDto = z.object({
  id: z.number().int(),
  name: z.string(),
  overall: z.number().int(),
  region: teamRegionSchema,
});

export type CreateTeamInput = z.infer<typeof createTeamDto>;
export type TeamResponse = z.infer<typeof teamResponseDto>;