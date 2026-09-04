import { teamService } from "../../services";
import { type CreateTeamInput } from "../../dtos"

export const teamResolvers = {
  Query: {
    teams: () => teamService.getAllTeams(),

    team: (
      _: unknown,
      args: { id: number },
    ) => teamService.getTeamById(args.id),

    teamsByRegion: (
      _: unknown,
      args: { region:  CreateTeamInput["region"] },
    ) => teamService.getTeamsByRegion(args.region),

    teamPlayers: (
      _: unknown,
      args: { teamId: number },
    ) => teamService.getTeamPlayers(args.teamId),
  },

  Mutation: {
    createTeam: (
      _: unknown,
      args: {
        input: CreateTeamInput 
      },
    ) => teamService.createTeam(args.input),
  },
};