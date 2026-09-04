// src/routes/team_routes.ts

import { Elysia, t } from "elysia";

import {
  addTeamToTournamentFromTeam,
  createTeam,
  getAllTeams,
  getTeamById,
  getTeamPlayers,
  getTeamTournaments,
  getTeamsByRegion,
  removeTeamFromTournamentFromTeam,
} from "../controlers";

export const teamRoutes = new Elysia({ prefix: "/teams" })
  .get("/", getAllTeams)
  .get("/:id", getTeamById, {
    params: t.Object({ id: t.String() }),
  })
  .get("/region/:region", getTeamsByRegion, {
    params: t.Object({ region: t.String() }),
  })
  .get("/:id/players", getTeamPlayers, {
    params: t.Object({ id: t.String() }),
  })
  .get("/:id/tournaments", getTeamTournaments, {
    params: t.Object({ id: t.String() }),
  })
  .post("/", createTeam)
  .post("/:id/tournaments/:tournamentId", addTeamToTournamentFromTeam, {
    params: t.Object({ id: t.String(), tournamentId: t.String() }),
  })
  .delete("/:id/tournaments/:tournamentId", removeTeamFromTournamentFromTeam, {
    params: t.Object({ id: t.String(), tournamentId: t.String() }),
  });
