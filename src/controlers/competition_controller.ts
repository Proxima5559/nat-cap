// src/controlers/competition_controller.ts

import type { Context } from "elysia";

import { competitionService } from "../services";
import { ErrorsUtil } from "../utils";
import type { CreateCompetitionInput } from "../dtos";
import { handleControllerError, parseId } from "./helpers";

export const getAllCompetitions = async ({ set }: Context) => {
  try {
    return await competitionService.getAllCompetitions();
  } catch (error) {
    set.status = 500;
    return handleControllerError(error, set);
  }
};

export const getCompetitionById = async ({
  params,
  set,
}: {
  params: { id: string };
  set: Context["set"];
}) => {
  try {
    const id = parseId(params.id);
    const competition = await competitionService.getCompetitionById(id);

    if (!competition) {
      throw new ErrorsUtil.NotFound("Competition not found", 404);
    }

    return competition;
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getCompetitionsByRegion = async ({
  params,
  set,
}: {
  params: { region: string };
  set: Context["set"];
}) => {
  try {
    return await competitionService.getCompetitionsByRegion(
      params.region as CreateCompetitionInput["region"],
    );
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getCompetitionTournaments = async ({
  params,
  set,
}: {
  params: { id: string };
  set: Context["set"];
}) => {
  try {
    const id = parseId(params.id, "competition id");
    return await competitionService.getCompetitionTournaments(id);
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const createCompetition = async ({
  body,
  set,
}: {
  body: unknown;
  set: Context["set"];
}) => {
  try {
    const competition = await competitionService.createCompetition(
      body as CreateCompetitionInput,
    );
    set.status = 201;
    return competition;
  } catch (error) {
    return handleControllerError(error, set);
  }
};
