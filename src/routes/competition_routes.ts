
import { Elysia, t } from "elysia";

import {
  createCompetition,
  getAllCompetitions,
  getCompetitionById,
  getCompetitionTournaments,
  getCompetitionsByRegion,
} from "../controlers";

export const competitionRoutes = new Elysia({ prefix: "/competitions" })
  .get("/", getAllCompetitions)
  .get("/:id", getCompetitionById, {
    params: t.Object({ id: t.String() }),
  })
  .get("/:id/tournaments", getCompetitionTournaments, {
    params: t.Object({ id: t.String() }),
  })
  .get("/region/:region", getCompetitionsByRegion, {
    params: t.Object({ region: t.String() }),
  })
  .post("/", createCompetition);
