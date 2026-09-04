
import { Elysia, t } from "elysia";

import {
  addTeamToTournament,
  completeTournament,
  createTournament,
  getAllTournaments,
  getTournamentById,
  getTournamentDetails,
  getTournamentTeams,
  getTournamentsByCompetition,
  getTournamentsByCycle,
  removeTeamFromTournament,
  startTournament,
} from "../controlers";

export const tournamentRoutes = new Elysia({ prefix: "/tournaments" })
  .get("/", getAllTournaments)
  .get("/:id", getTournamentById, {
    params: t.Object({ id: t.String() }),
  })
  .get("/:id/details", getTournamentDetails, {
    params: t.Object({ id: t.String() }),
  })
  .get("/:id/teams", getTournamentTeams, {
    params: t.Object({ id: t.String() }),
  })
  .get("/cycle/:cycleId", getTournamentsByCycle, {
    params: t.Object({ cycleId: t.String() }),
  })
  .get("/competition/:competitionId", getTournamentsByCompetition, {
    params: t.Object({ competitionId: t.String() }),
  })
  .post("/", createTournament)
  .post("/:id/teams/:teamId", addTeamToTournament, {
    params: t.Object({ id: t.String(), teamId: t.String() }),
  })
  .delete("/:id/teams/:teamId", removeTeamFromTournament, {
    params: t.Object({ id: t.String(), teamId: t.String() }),
  })
  .post("/:id/start", startTournament, {
    params: t.Object({ id: t.String() }),
  })
  .post("/:id/complete", completeTournament, {
    params: t.Object({ id: t.String() }),
  });
