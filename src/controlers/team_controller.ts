// src/controlers/team_controller.ts

import type { Context } from "elysia";

import { teamService } from "../services";
import { ErrorsUtil } from "../utils";
import type { CreateTeamInput } from "../dtos";
import { handleControllerError, parseId } from "./helpers";

export const getAllTeams = async ({ set }: Context) => {
  try {
    return await teamService.getAllTeams();
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getTeamById = async ({
  params,
  set,
}: {
  params: { id: string };
  set: Context["set"];
}) => {
  try {
    const id = parseId(params.id);
    const team = await teamService.getTeamById(id);

    if (!team) {
      throw new ErrorsUtil.NotFound("Team not found", 404);
    }

    return team;
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getTeamsByRegion = async ({
  params,
  set,
}: {
  params: { region: string };
  set: Context["set"];
}) => {
  try {
    return await teamService.getTeamsByRegion(
      params.region as CreateTeamInput["region"],
    );
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getTeamPlayers = async ({
  params,
  set,
}: {
  params: { id: string };
  set: Context["set"];
}) => {
  try {
    const id = parseId(params.id, "team id");
    return await teamService.getTeamPlayers(id);
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getTeamTournaments = async ({
  params,
  set,
}: {
  params: { id: string };
  set: Context["set"];
}) => {
  try {
    const id = parseId(params.id, "team id");
    return await teamService.getTeamTournaments(id);
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const createTeam = async ({
  body,
  set,
}: {
  body: unknown;
  set: Context["set"];
}) => {
  try {
    const team = await teamService.createTeam(body as CreateTeamInput);
    set.status = 201;
    return team;
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const addTeamToTournament = async ({
  params,
  set,
}: {
  params: { id: string; tournamentId: string };
  set: Context["set"];
}) => {
  try {
    const teamId = parseId(params.id, "team id");
    const tournamentId = parseId(params.tournamentId, "tournament id");

    const result = await teamService.addTeamToTournament(teamId, tournamentId);
    set.status = 201;
    return result;
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const removeTeamFromTournament = async ({
  params,
  set,
}: {
  params: { id: string; tournamentId: string };
  set: Context["set"];
}) => {
  try {
    const teamId = parseId(params.id, "team id");
    const tournamentId = parseId(params.tournamentId, "tournament id");

    return await teamService.removeTeamFromTournament(teamId, tournamentId);
  } catch (error) {
    return handleControllerError(error, set);
  }
};
