// src/controlers/tournament_controller.ts

import type { Context } from "elysia";

import { tournamentService } from "../services";
import { ErrorsUtil } from "../utils";
import type { CreateTournamentInput } from "../dtos";
import { handleControllerError, parseId } from "./helpers";

export const getAllTournaments = async ({ set }: Context) => {
  try {
    return await tournamentService.getAllTournaments();
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getTournamentById = async ({
  params,
  set,
}: {
  params: { id: string };
  set: Context["set"];
}) => {
  try {
    const id = parseId(params.id);
    const tournament = await tournamentService.getTournamentById(id);

    if (!tournament) {
      throw new ErrorsUtil.NotFound("Tournament not found", 404);
    }

    return tournament;
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getTournamentDetails = async ({
  params,
  set,
}: {
  params: { id: string };
  set: Context["set"];
}) => {
  try {
    const id = parseId(params.id);
    const details = await tournamentService.getTournamentDetails(id);

    if (!details) {
      throw new ErrorsUtil.NotFound("Tournament not found", 404);
    }

    return details;
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getTournamentsByCycle = async ({
  params,
  set,
}: {
  params: { cycleId: string };
  set: Context["set"];
}) => {
  try {
    const cycleId = parseId(params.cycleId, "cycle id");
    return await tournamentService.getTournamentsByCycle(cycleId);
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getTournamentsByCompetition = async ({
  params,
  set,
}: {
  params: { competitionId: string };
  set: Context["set"];
}) => {
  try {
    const competitionId = parseId(params.competitionId, "competition id");
    return await tournamentService.getTournamentsByCompetition(competitionId);
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getTournamentTeams = async ({
  params,
  set,
}: {
  params: { id: string };
  set: Context["set"];
}) => {
  try {
    const id = parseId(params.id, "tournament id");
    return await tournamentService.getTournamentTeams(id);
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const createTournament = async ({
  body,
  set,
}: {
  body: unknown;
  set: Context["set"];
}) => {
  try {
    const tournament = await tournamentService.createTournament(
      body as CreateTournamentInput,
    );
    set.status = 201;
    return tournament;
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const addTeamToTournament = async ({
  params,
  set,
}: {
  params: { id: string; teamId: string };
  set: Context["set"];
}) => {
  try {
    const tournamentId = parseId(params.id, "tournament id");
    const teamId = parseId(params.teamId, "team id");

    await tournamentService.addTeamToTournament(tournamentId, teamId);
    set.status = 201;
    return { tournamentId, teamId };
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const removeTeamFromTournament = async ({
  params,
  set,
}: {
  params: { id: string; teamId: string };
  set: Context["set"];
}) => {
  try {
    const tournamentId = parseId(params.id, "tournament id");
    const teamId = parseId(params.teamId, "team id");

    await tournamentService.removeTeamFromTournament(tournamentId, teamId);
    set.status = 204;
    return null;
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const startTournament = async ({
  params,
  set,
}: {
  params: { id: string };
  set: Context["set"];
}) => {
  try {
    const id = parseId(params.id);
    const tournament = await tournamentService.startTournament(id);

    if (!tournament) {
      throw new ErrorsUtil.NotFound("Tournament not found", 404);
    }

    return tournament;
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const completeTournament = async ({
  params,
  set,
}: {
  params: { id: string };
  set: Context["set"];
}) => {
  try {
    const id = parseId(params.id);
    const tournament = await tournamentService.completeTournament(id);

    if (!tournament) {
      throw new ErrorsUtil.NotFound("Tournament not found", 404);
    }

    return tournament;
  } catch (error) {
    return handleControllerError(error, set);
  }
};
