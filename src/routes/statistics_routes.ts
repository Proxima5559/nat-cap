import { Elysia, t } from "elysia";

import {
  createPlayerStatistics,
  getPlayerStatistics,
  getPlayerStatisticsByCycle,
  getPlayerStatisticsByPlayer,
  getPlayerStatisticsByTeam,
  updatePlayerStatistics,
} from "../controlers";

export const statisticsRoutes = new Elysia({ prefix: "/statistics" })
  .get("/cycle/:cycleId/player/:playerId", getPlayerStatistics, {
    params: t.Object({ cycleId: t.String(), playerId: t.String() }),
  })
  .get("/cycle/:cycleId", getPlayerStatisticsByCycle, {
    params: t.Object({ cycleId: t.String() }),
  })
  .get("/player/:playerId", getPlayerStatisticsByPlayer, {
    params: t.Object({ playerId: t.String() }),
  })
  .get("/cycle/:cycleId/team/:teamId", getPlayerStatisticsByTeam, {
    params: t.Object({ cycleId: t.String(), teamId: t.String() }),
  })
  .post("/cycle/:cycleId/player/:playerId", createPlayerStatistics, {
    params: t.Object({ cycleId: t.String(), playerId: t.String() }),
  })
  .patch("/cycle/:cycleId/player/:playerId", updatePlayerStatistics, {
    params: t.Object({ cycleId: t.String(), playerId: t.String() }),
  });
