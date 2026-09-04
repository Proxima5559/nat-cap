

import { Elysia } from "elysia";

import { competitionRoutes } from "./competition_routes";
import { cycleRoutes } from "./cycle_routes";
import { matchRoutes } from "./match_routes";
import { playerRoutes } from "./player_routes";
import { statisticsRoutes } from "./statistics_routes";
import { teamRoutes } from "./team_routes";
import { tournamentRoutes } from "./tournament_routes";

export const routes = new Elysia()
  .use(competitionRoutes)
  .use(cycleRoutes)
  .use(matchRoutes)
  .use(playerRoutes)
  .use(statisticsRoutes)
  .use(teamRoutes)
  .use(tournamentRoutes);
