import { createSchema } from "graphql-yoga";
import { type GraphQLContext } from "./context"; 

import {
  cycleResolvers,
  competitionResolvers,
  matchResolvers,
  teamResolvers,
  playerResolvers,
  tournamentResolvers,
  statisticsResolvers,
} from "./resolvers";

export const schema = createSchema<GraphQLContext>({ 
  typeDefs: /* GraphQL */ `
    scalar DateTime

    enum CycleStatus {
      created
      running
      completed
      failed
    }

    enum TournamentStatus {
      created
      running
      completed
    }

    enum MatchStatus {
      scheduled
      live
      completed
    }


    type Cycle {
      id: Int!
      seed: Int!
      status: CycleStatus!
      createdAt: DateTime!
      completedAt: DateTime
    }

    input CreateCycleInput {
      seed: Int!
    }


    type Team {
      id: Int!
      name: String!
      overall: Int!
      region: String!
    }

    input CreateTeamInput {
      name: String!
      overall: Int!
      region: String!
    }


    type Player {
      id: Int!
      teamId: Int!
      name: String!
      position: String!
      ability: Int!
    }

    input CreatePlayerInput {
      teamId: Int!
      name: String!
      position: String!
      ability: Int!
    }

    type Competition {
      id: Int!
      name: String!
      region: String!
      type: String!
    }

    input CreateCompetitionInput {
      name: String!
      region: String!
      type: String!
    }


    type Tournament {
      id: Int!
      cycleId: Int!
      competitionId: Int!
      name: String!
      status: TournamentStatus!
      startedAt: DateTime
      completedAt: DateTime
    }

    input CreateTournamentInput {
      cycleId: Int!
      competitionId: Int!
      name: String!
    }


    type Match {
      id: Int!
      tournamentId: Int!
      homeTeamId: Int!
      awayTeamId: Int!
      homeScore: Int
      awayScore: Int
      status: MatchStatus!
      playedAt: DateTime
    }

    input CreateMatchInput {
      tournamentId: Int!
      homeTeamId: Int!
      awayTeamId: Int!
    }


    type PlayerStatistics {
      playerId: Int!
      appearances: Int!
      starts: Int!
      minutes: Int!
      goals: Int!
      assists: Int!
      shots: Int!
      shotsOnTarget: Int!
      yellowCards: Int!
      redCards: Int!
      averageRating: Float!
    }

    input UpdatePlayerStatisticsInput {
      appearances: Int
      starts: Int
      minutes: Int
      goals: Int
      assists: Int
      shots: Int
      shotsOnTarget: Int
      yellowCards: Int
      redCards: Int
      averageRating: Float
    }

    type Query {
      cycles: [Cycle!]!
      cycle(id: Int!): Cycle

      teams: [Team!]!
      team(id: Int!): Team
      teamsByRegion(region: String!): [Team!]!
      teamPlayers(teamId: Int!): [Player!]!
      
      players: [Player!]! 
      player(id: Int!): Player
      playersByTeam(teamId: Int!): [Player!]!

      competitions: [Competition!]!
      competition(id: Int!): Competition
      competitionsByRegion(region: String!): [Competition!]!

      tournaments: [Tournament!]!
      tournament(id: Int!): Tournament
      tournamentsByCycle(cycleId: Int!): [Tournament!]!
      tournamentsByCompetition(competitionId: Int!): [Tournament!]!

      matches: [Match!]!
      match(id: Int!): Match
      matchesByTournament(tournamentId: Int!): [Match!]!
      matchesByTeam(teamId: Int!): [Match!]!

      playerStatistics(
        cycleId: Int!
        playerId: Int!
      ): PlayerStatistics

      playerStatisticsByCycle(
        cycleId: Int!
      ): [PlayerStatistics!]!

      playerStatisticsByPlayer(
        playerId: Int!
      ): [PlayerStatistics!]!
    }


    type Mutation {
      createCycle(input: CreateCycleInput!): Cycle!
      startCycle(id: Int!): Cycle
      completeCycle(id: Int!): Cycle
      failCycle(id: Int!): Cycle

      createTeam(input: CreateTeamInput!): Team!

      createPlayer(input: CreatePlayerInput!): Player!
      updatePlayerAbility(id: Int!, ability: Int!): Player 
      
      createCompetition(
        input: CreateCompetitionInput!
      ): Competition!

      createTournament(
        input: CreateTournamentInput!
      ): Tournament!

      addTeamToTournament(
        tournamentId: Int!
        teamId: Int!
      ): Boolean!

      removeTeamFromTournament(
        tournamentId: Int!
        teamId: Int!
      ): Boolean!

      startTournament(id: Int!): Tournament
      completeTournament(id: Int!): Tournament

      createMatch(input: CreateMatchInput!): Match!
      startMatch(id: Int!): Match

      completeMatch(
        id: Int!
        homeScore: Int!
        awayScore: Int!
      ): Match

      createPlayerStatistics(
        cycleId: Int!
        playerId: Int!
      ): PlayerStatistics!

      updatePlayerStatistics(
        cycleId: Int!
        playerId: Int!
        data: UpdatePlayerStatisticsInput!
      ): PlayerStatistics
    }
  `,

  resolvers: [
    cycleResolvers,
    teamResolvers,
    playerResolvers,
    competitionResolvers,
    tournamentResolvers,
    matchResolvers,
    statisticsResolvers,
  ],
});