
import type { Context } from "elysia";

import { statisticsService } from "../services";
import { ErrorsUtil } from "../utils";
import type { PlayerStatistics } from "../dtos";
import { handleControllerError, parseId } from "./helpers";

export const getPlayerStatistics = async ({
  params,
  set,
}: {
  params: { cycleId: string; playerId: string };
  set: Context["set"];
}) => {
  try {
    const cycleId = parseId(params.cycleId, "cycle id");
    const playerId = parseId(params.playerId, "player id");

    const statistics = await statisticsService.getPlayerStatistics(
      cycleId,
      playerId,
    );

    if (!statistics) {
      throw new ErrorsUtil.NotFound("Player statistics not found", 404);
    }

    return statistics;
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getPlayerStatisticsByCycle = async ({
  params,
  set,
}: {
  params: { cycleId: string };
  set: Context["set"];
}) => {
  try {
    const cycleId = parseId(params.cycleId, "cycle id");
    return await statisticsService.getPlayerStatisticsByCycle(cycleId);
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getPlayerStatisticsByPlayer = async ({
  params,
  set,
}: {
  params: { playerId: string };
  set: Context["set"];
}) => {
  try {
    const playerId = parseId(params.playerId, "player id");
    return await statisticsService.getPlayerStatisticsByPlayer(playerId);
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getPlayerStatisticsByTeam = async ({
  params,
  set,
}: {
  params: { cycleId: string; teamId: string };
  set: Context["set"];
}) => {
  try {
    const cycleId = parseId(params.cycleId, "cycle id");
    const teamId = parseId(params.teamId, "team id");

    return await statisticsService.getPlayerStatisticsByTeam(cycleId, teamId);
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const createPlayerStatistics = async ({
  params,
  set,
}: {
  params: { cycleId: string; playerId: string };
  set: Context["set"];
}) => {
  try {
    const cycleId = parseId(params.cycleId, "cycle id");
    const playerId = parseId(params.playerId, "player id");

    const statistics = await statisticsService.createPlayerStatistics(
      cycleId,
      playerId,
    );
    set.status = 201;
    return statistics;
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const updatePlayerStatistics = async ({
  params,
  body,
  set,
}: {
  params: { cycleId: string; playerId: string };
  body: unknown;
  set: Context["set"];
}) => {
  try {
    const cycleId = parseId(params.cycleId, "cycle id");
    const playerId = parseId(params.playerId, "player id");

    const statistics = await statisticsService.updatePlayerStatistics(
      cycleId,
      playerId,
      body as Partial<Omit<PlayerStatistics, "playerId">>,
    );

    if (!statistics) {
      throw new ErrorsUtil.NotFound("Player statistics not found", 404);
    }

    return statistics;
  } catch (error) {
    return handleControllerError(error, set);
  }
};
