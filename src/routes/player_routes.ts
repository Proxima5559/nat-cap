import { Elysia, t } from "elysia";

import {
  createPlayer,
  getAllPlayers,
  getPlayerById,
  getPlayersByTeam,
  updatePlayerAbility,
} from "../controlers";

export const playerRoutes = new Elysia({ prefix: "/players" })
  .get("/", getAllPlayers)
  .get("/:id", getPlayerById, {
    params: t.Object({ id: t.String() }),
  })
  .get("/team/:teamId", getPlayersByTeam, {
    params: t.Object({ teamId: t.String() }),
  })
  .post("/", createPlayer)
  .patch("/:id/ability", updatePlayerAbility, {
    params: t.Object({ id: t.String() }),
  });
