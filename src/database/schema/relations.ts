import { relations } from "drizzle-orm";

import { cycles } from "./cycles";
import { teams } from "./teams";
import { players } from "./players";
import { competitions } from "./competitions";
import { tournaments } from "./tournaments";
import { tournamentTeams } from "./tournament_teams";
import { matches } from "./matches";
import { matchEvents } from "./match_events";
import { standings } from "./standings";
import { playerStatistics } from "./statistics";

export const cyclesRelations = relations(
  cycles,
  ({ many }) => ({
    tournaments: many(tournaments),

    playerStatistics: many(playerStatistics),
  }),
);

export const competitionsRelations = relations(
  competitions,
  ({ many }) => ({
    tournaments: many(tournaments),
  }),
);

export const tournamentsRelations = relations(
  tournaments,
  ({ one, many }) => ({
    cycle: one(cycles, {
      fields: [tournaments.cycleId],
      references: [cycles.id],
    }),

    competition: one(competitions, {
      fields: [tournaments.competitionId],
      references: [competitions.id],
    }),

    matches: many(matches),

    standings: many(standings),

    tournamentTeams: many(tournamentTeams),
  }),
);

export const teamsRelations = relations(
  teams,
  ({ many }) => ({
    players: many(players),

    homeMatches: many(matches, {
      relationName: "homeTeam",
    }),

    awayMatches: many(matches, {
      relationName: "awayTeam",
    }),

    matchEvents: many(matchEvents),

    standings: many(standings),

    tournamentTeams: many(tournamentTeams),
  }),
);


export const playersRelations = relations(
  players,
  ({ one, many }) => ({
    team: one(teams, {
      fields: [players.teamId],
      references: [teams.id],
    }),

    matchEvents: many(matchEvents, {
      relationName: "primaryPlayer",
    }),

    secondaryMatchEvents: many(matchEvents, {
      relationName: "secondaryPlayer",
    }),

    statistics: many(playerStatistics),
  }),
);


export const matchesRelations = relations(
  matches,
  ({ one, many }) => ({
    tournament: one(tournaments, {
      fields: [matches.tournamentId],
      references: [tournaments.id],
    }),

    homeTeam: one(teams, {
      fields: [matches.homeTeamId],
      references: [teams.id],
      relationName: "homeTeam",
    }),

    awayTeam: one(teams, {
      fields: [matches.awayTeamId],
      references: [teams.id],
      relationName: "awayTeam",
    }),

    events: many(matchEvents),
  }),
);


export const matchEventsRelations = relations(
  matchEvents,
  ({ one }) => ({
    match: one(matches, {
      fields: [matchEvents.matchId],
      references: [matches.id],
    }),

    team: one(teams, {
      fields: [matchEvents.teamId],
      references: [teams.id],
    }),

    player: one(players, {
      fields: [matchEvents.playerId],
      references: [players.id],
      relationName: "primaryPlayer",
    }),

    secondaryPlayer: one(players, {
      fields: [matchEvents.secondaryPlayerId],
      references: [players.id],
      relationName: "secondaryPlayer",
    }),
  }),
);

export const standingsRelations = relations(
  standings,
  ({ one }) => ({
    tournament: one(tournaments, {
      fields: [standings.tournamentId],
      references: [tournaments.id],
    }),

    team: one(teams, {
      fields: [standings.teamId],
      references: [teams.id],
    }),
  }),
);

export const playerStatisticsRelations = relations(
  playerStatistics,
  ({ one }) => ({
    cycle: one(cycles, {
      fields: [playerStatistics.cycleId],
      references: [cycles.id],
    }),

    player: one(players, {
      fields: [playerStatistics.playerId],
      references: [players.id],
    }),
  }),
);

export const tournamentTeamsRelations = relations(
  tournamentTeams,
  ({ one }) => ({
    tournament: one(tournaments, {
      fields: [tournamentTeams.tournamentId],
      references: [tournaments.id],
    }),

    team: one(teams, {
      fields: [tournamentTeams.teamId],
      references: [teams.id],
    }),
  }),
);