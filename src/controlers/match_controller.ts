// src/controlers/match_controller.ts

import type { Context } from "elysia";

import { matchService } from "../services";
import { ErrorsUtil } from "../utils";
import type { CreateMatchInput } from "../dtos";
import { handleControllerError, parseId } from "./helpers";

export const getAllMatches = async ({ set }: Context) => {
  try {
    return await matchService.getAllMatches();
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getMatchById = async ({
  params,
  set,
}: {
  params: { id: string };
  set: Context["set"];
}) => {
  try {
    const id = parseId(params.id);
    const match = await matchService.getMatchById(id);

    if (!match) {
      throw new ErrorsUtil.NotFound("Match not found", 404);
    }

    return match;
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getMatchesByTournament = async ({
  params,
  set,
}: {
  params: { tournamentId: string };
  set: Context["set"];
}) => {
  try {
    const tournamentId = parseId(params.tournamentId, "tournament id");
    return await matchService.getMatchesByTournament(tournamentId);
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getMatchesByTeam = async ({
  params,
  set,
}: {
  params: { teamId: string };
  set: Context["set"];
}) => {
  try {
    const teamId = parseId(params.teamId, "team id");
    return await matchService.getMatchesByTeam(teamId);
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getMatchEvents = async ({
  params,
  set,
}: {
  params: { id: string };
  set: Context["set"];
}) => {
  try {
    const id = parseId(params.id, "match id");
    return await matchService.getMatchEvents(id);
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const createMatch = async ({
  body,
  set,
}: {
  body: unknown;
  set: Context["set"];
}) => {
  try {
    const match = await matchService.createMatch(body as CreateMatchInput);
    set.status = 201;
    return match;
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const startMatch = async ({
  params,
  set,
}: {
  params: { id: string };
  set: Context["set"];
}) => {
  try {
    const id = parseId(params.id);
    const match = await matchService.startMatch(id);

    if (!match) {
      throw new ErrorsUtil.NotFound("Match not found", 404);
    }

    return match;
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const completeMatch = async ({
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
    const { homeScore, awayScore } = body as {
      homeScore: number;
      awayScore: number;
    };

    const match = await matchService.completeMatch(id, homeScore, awayScore);

    if (!match) {
      throw new ErrorsUtil.NotFound("Match not found", 404);
    }

    return match;
  } catch (error) {
    return handleControllerError(error, set);
  }
};
