// src/controlers/helpers.ts
// Shared helpers for turning ErrorsUtil errors into HTTP responses.

import type { Context } from "elysia";
import { ZodError } from "zod";
import { ErrorsUtil } from "../utils";

type SetType = Context["set"];

const DEFAULT_STATUS = 500;


export function handleControllerError(error: unknown, set: SetType) {
  if (error instanceof ZodError) {
    set.status = 400;

    return {
      error: "ValidationError",
      message: "Invalid request data",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  if (error instanceof Error) {
    const status = (error as Error & { status?: number }).status ?? DEFAULT_STATUS;

    set.status = status;

    return {
      error: error.name,
      message: error.message || "Something went wrong",
    };
  }

  set.status = DEFAULT_STATUS;

  return {
    error: "InternalServerError",
    message: "Something went wrong",
  };
}

export function parseId(raw: string, label = "id"): number {
  const id = Number(raw);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorsUtil.ValidationError(`Invalid ${label}`, 400);
  }

  return id;
}
