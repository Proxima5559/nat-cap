import type { Context } from "elysia";

import { cycleService } from "../services";
import { ErrorsUtil } from "../utils";
import type { CreateCycleInput } from "../dtos";
import { handleControllerError, parseId } from "./helpers";

export const getAllCycles = async ({ set }: Context) => {
  try {
    return await cycleService.getAllCycles();
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const getCycleById = async ({
  params,
  set,
}: {
  params: { id: string };
  set: Context["set"];
}) => {
  try {
    const id = parseId(params.id);
    const cycle = await cycleService.getCycleById(id);

    if (!cycle) {
      throw new ErrorsUtil.NotFound("Cycle not found", 404);
    }

    return cycle;
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const createCycle = async ({
  body,
  set,
}: {
  body: unknown;
  set: Context["set"];
}) => {
  try {
    const cycle = await cycleService.createCycle(body as CreateCycleInput);
    set.status = 201;
    return cycle;
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const startCycle = async ({
  params,
  set,
}: {
  params: { id: string };
  set: Context["set"];
}) => {
  try {
    const id = parseId(params.id);
    const cycle = await cycleService.startCycle(id);

    if (!cycle) {
      throw new ErrorsUtil.NotFound("Cycle not found", 404);
    }

    return cycle;
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const completeCycle = async ({
  params,
  set,
}: {
  params: { id: string };
  set: Context["set"];
}) => {
  try {
    const id = parseId(params.id);
    const cycle = await cycleService.completeCycle(id);

    if (!cycle) {
      throw new ErrorsUtil.NotFound("Cycle not found", 404);
    }

    return cycle;
  } catch (error) {
    return handleControllerError(error, set);
  }
};

export const failCycle = async ({
  params,
  set,
}: {
  params: { id: string };
  set: Context["set"];
}) => {
  try {
    const id = parseId(params.id);
    const cycle = await cycleService.failCycle(id);

    if (!cycle) {
      throw new ErrorsUtil.NotFound("Cycle not found", 404);
    }

    return cycle;
  } catch (error) {
    return handleControllerError(error, set);
  }
};
