// src/routes/match_routes.ts

import { Elysia, t } from "elysia";

import {
  completeMatch,
  createMatch,
  getAllMatches,
  getMatchById,
  getMatchEvents,
  getMatchesByTeam,
  getMatchesByTournament,
  startMatch,
} from "../controlers";

export const matchRoutes = new Elysia({ prefix: "/matches" })
  .get("/", getAllMatches)
  .get("/:id", getMatchById, {
    params: t.Object({ id: t.String() }),
  })
  .get("/:id/events", getMatchEvents, {
    params: t.Object({ id: t.String() }),
  })
  .get("/tournament/:tournamentId", getMatchesByTournament, {
    params: t.Object({ tournamentId: t.String() }),
  })
  .get("/team/:teamId", getMatchesByTeam, {
    params: t.Object({ teamId: t.String() }),
  })
  .post("/", createMatch)
  .post("/:id/start", startMatch, {
    params: t.Object({ id: t.String() }),
  })
  .post("/:id/complete", completeMatch, {
    params: t.Object({ id: t.String() }),
  });
