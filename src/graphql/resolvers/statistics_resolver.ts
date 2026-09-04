import { statisticsService } from "../../services";

export const statisticsResolvers = {
  Query: {
    playerStatistics: (
      _: unknown,
      args: {
        cycleId: number;
        playerId: number;
      },
    ) =>
      statisticsService.getPlayerStatistics(
        args.cycleId,
        args.playerId,
      ),

    playerStatisticsByCycle: (
      _: unknown,
      args: { cycleId: number },
    ) =>
      statisticsService.getPlayerStatisticsByCycle(
        args.cycleId,
      ),

    playerStatisticsByPlayer: (
      _: unknown,
      args: { playerId: number },
    ) =>
      statisticsService.getPlayerStatisticsByPlayer(
        args.playerId,
      ),
  },

  Mutation: {
    createPlayerStatistics: (
      _: unknown,
      args: {
        cycleId: number;
        playerId: number;
      },
    ) =>
      statisticsService.createPlayerStatistics(
        args.cycleId,
        args.playerId,
      ),

    updatePlayerStatistics: (
      _: unknown,
      args: {
        cycleId: number;
        playerId: number;
        data: Record<string, unknown>;
      },
    ) =>
      statisticsService.updatePlayerStatistics(
        args.cycleId,
        args.playerId,
        args.data,
      ),
  },
};