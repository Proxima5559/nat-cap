import { playerService } from "../../services";
import { type CreatePlayerInput } from "../../dtos"

export const playerResolvers = {
  Query: {
    players: () => playerService.getAllPlayers(),

    player: (
      _: unknown,
      args: { id: number },
    ) => playerService.getPlayerById(args.id),

    playersByTeam: (
      _: unknown,
      args: { teamId: number },
    ) => playerService.getPlayersByTeam(args.teamId),

    teamPlayers: (
      _: unknown,
      args: { teamId: number },
    ) => playerService.getPlayersByTeam(args.teamId),
  },

  Mutation: {
    createPlayer: (
      _: unknown,
      args: { input: CreatePlayerInput },
    ) => playerService.createPlayer(args.input),

    updatePlayerAbility: (
      _: unknown,
      args: { id: number; ability: number },
    ) => playerService.updatePlayerAbility(args.id, args.ability),
  },
};