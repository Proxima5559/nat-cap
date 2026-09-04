
import { Elysia, t } from "elysia";

import {
  completeCycle,
  createCycle,
  failCycle,
  getAllCycles,
  getCycleById,
  startCycle,
} from "../controlers";

export const cycleRoutes = new Elysia({ prefix: "/cycles" })
  .get("/", getAllCycles)
  .get("/:id", getCycleById, {
    params: t.Object({ id: t.String() }),
  })
  .post("/", createCycle)
  .post("/:id/start", startCycle, {
    params: t.Object({ id: t.String() }),
  })
  .post("/:id/complete", completeCycle, {
    params: t.Object({ id: t.String() }),
  })
  .post("/:id/fail", failCycle, {
    params: t.Object({ id: t.String() }),
  });
