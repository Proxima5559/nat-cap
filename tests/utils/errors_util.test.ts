import { describe, expect, test } from "bun:test";
import { ErrorsUtil } from "../../src/utils";

describe("ErrorsUtil", () => {
  test("builds a distinct Error subclass per name", () => {
    const notFound = new ErrorsUtil.NotFound("missing", 404);

    expect(notFound).toBeInstanceOf(Error);
    expect(notFound.name).toBe("NotFound");
    expect(notFound.message).toBe("missing");
    expect(notFound.status).toBe(404);
  });

  test("every declared error class is constructible and carries its own name", () => {
    const names = [
      "NotFound", "CreationFailedError", "ConflictError", "Forbidden",
      "PermissionError", "InputValidationError", "InvalidEmailConfirmError",
      "InvalidPasswordError", "MicroserviceError", "UnauthorizedError",
      "ResourceNotFoundError", "ValidationError",
    ] as const;

    for (const name of names) {
      const ErrorClass = ErrorsUtil[name];
      const instance = new ErrorClass("oops", 400);

      expect(instance).toBeInstanceOf(Error);
      expect(instance.name).toBe(name);
    }
  });

  test("defaults message to an empty string and leaves status undefined when omitted", () => {
    const error = new ErrorsUtil.ConflictError();

    expect(error.message).toBe("");
    expect(error.status).toBeUndefined();
  });

  test("is catchable as a plain Error (e.g. by controller error handlers)", () => {
    const thrower = () => {
      throw new ErrorsUtil.ValidationError("bad input", 400);
    };

    expect(thrower).toThrow(Error);
    expect(thrower).toThrow("bad input");
  });
});
