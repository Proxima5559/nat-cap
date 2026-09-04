

import { asc, eq } from "drizzle-orm";

import { db } from "../config/database";
import { players } from "../database/schema";
import { ErrorsUtil } from "../utils";
import {
  createPlayerDto,
  playerResponseDto,
  type CreatePlayerInput,
  type PlayerResponse,
} from "../dtos";

export class PlayerService {
  async getAllPlayers(): Promise<PlayerResponse[]> {
    const result = await db
      .select()
      .from(players)
      .orderBy(asc(players.name));

    return result.map((player) => playerResponseDto.parse(player));
  }

  async getPlayerById(id: number): Promise<PlayerResponse | null> {
    const result = await db
      .select()
      .from(players)
      .where(eq(players.id, id))
      .limit(1);

    const player = result[0];

    if (!player) {
      return null;
    }

    return playerResponseDto.parse(player);
  }

  async getPlayersByTeam(teamId: number): Promise<PlayerResponse[]> {
    const result = await db
      .select()
      .from(players)
      .where(eq(players.teamId, teamId))
      .orderBy(asc(players.name));

    return result.map((player) => playerResponseDto.parse(player));
  }

  async createPlayer(input: CreatePlayerInput): Promise<PlayerResponse> {
    const validatedInput = createPlayerDto.parse(input);

    const result = await db
      .insert(players)
      .values({
        teamId: validatedInput.teamId,
        name: validatedInput.name,
        position: validatedInput.position,
        ability: validatedInput.ability,
      })
      .returning();

    const player = result[0];

    if (!player) {
      throw new ErrorsUtil.CreationFailedError("Failed to create player", 400);
    }

    return playerResponseDto.parse(player);
  }

  async updatePlayerAbility(
    id: number,
    ability: number,
  ): Promise<PlayerResponse | null> {
    if (!Number.isInteger(ability) || ability < 1 || ability > 100) {
      throw new ErrorsUtil.ValidationError(
        "Ability must be an integer between 1 and 100",
        400,
      );
    }

    const result = await db
      .update(players)
      .set({ ability })
      .where(eq(players.id, id))
      .returning();

    const player = result[0];

    if (!player) {
      return null;
    }

    return playerResponseDto.parse(player);
  }
}

export const playerService = new PlayerService();
