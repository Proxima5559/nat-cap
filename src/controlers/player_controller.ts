// src/controlers/player_controller.ts

import type { Context } from "elysia";

import { playerService } from "../services";
import { ErrorsUtil } from "../utils";
import type { CreatePlayerInput } from "../dtos";
import { handleControllerError, parseId } from "./helpers";

export const getAllPlayers = async ({ set }: Context) => {
  try {
    return await playerService.getAllPlayers();
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getPlayerById = async ({
  params,
  set,
}: {
  params: { id: string };
  set: Context["set"];
}) => {
  try {
    const id = parseId(params.id);
    const player = await playerService.getPlayerById(id);

    if (!player) {
      throw new ErrorsUtil.NotFound("Player not found", 404);
    }

    return player;
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getPlayersByTeam = async ({
  params,
  set,
}: {
  params: { teamId: string };
  set: Context["set"];
}) => {
  try {
    const teamId = parseId(params.teamId, "team id");
    return await playerService.getPlayersByTeam(teamId);
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const createPlayer = async ({
  body,
  set,
}: {
  body: unknown;
  set: Context["set"];
}) => {
  try {
    const player = await playerService.createPlayer(body as CreatePlayerInput);
    set.status = 201;
    return player;
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const updatePlayerAbility = async ({
  params,
  body,
  set,
}: {
  params: { id: string };
  body: unknown;
  set: Context["set"];
}) => {
  try {
    const id = parseId(params.id);
    const { ability } = body as { ability: number };

    const player = await playerService.updatePlayerAbility(id, ability);

    if (!player) {
      throw new ErrorsUtil.NotFound("Player not found", 404);
    }

    return player;
  } catch (error) {
    return handleControllerError(error, set);
  }
};
