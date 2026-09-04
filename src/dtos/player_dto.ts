import { z } from "zod";

import { PLAYER_POSITIONS } from "../data/player_pos";

export const playerPositionSchema = z.enum(PLAYER_POSITIONS);

export const createPlayerDto = z.object({
  teamId: z.number().int().positive(),

  name: z.string().min(1).max(100),

  position: playerPositionSchema,

  ability: z.number().int().min(1).max(100),
});

export const playerResponseDto = z.object({
  id: z.number().int(),

  teamId: z.number().int(),

  name: z.string(),

  position: playerPositionSchema,

  ability: z.number().int(),
});

export type CreatePlayerInput = z.infer<typeof createPlayerDto>;
export type PlayerResponse = z.infer<typeof playerResponseDto>;