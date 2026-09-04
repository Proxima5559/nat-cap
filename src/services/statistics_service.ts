import { and, asc, eq } from "drizzle-orm";

import { db } from "../config/database";
import {
  playerStatistics,
  players,
} from "../database/schema";

import { ErrorsUtil } from "../utils";
import {
  playerStatisticsDto,
  type PlayerStatistics,
} from "../dtos";

export class StatisticsService {
  private parseStatistics(
    statistics: typeof playerStatistics.$inferSelect,
  ): PlayerStatistics {
    return playerStatisticsDto.parse({
      playerId: statistics.playerId,
      appearances: statistics.appearances,
      starts: statistics.starts,
      minutes: statistics.minutes,
      goals: statistics.goals,
      assists: statistics.assists,
      shots: statistics.shots,
      shotsOnTarget: statistics.shotsOnTarget,
      yellowCards: statistics.yellowCards,
      redCards: statistics.redCards,
      averageRating: statistics.averageRating,
    });
  }

  async getPlayerStatistics(
    cycleId: number,
    playerId: number,
  ): Promise<PlayerStatistics | null> {
    const result = await db
      .select()
      .from(playerStatistics)
      .where(
        and(
          eq(playerStatistics.cycleId, cycleId),
          eq(playerStatistics.playerId, playerId),
        ),
      )
      .limit(1);

    const statistics = result[0];

    return statistics
      ? this.parseStatistics(statistics)
      : null;
  }

  async getPlayerStatisticsByCycle(
    cycleId: number,
  ): Promise<PlayerStatistics[]> {
    const result = await db
      .select()
      .from(playerStatistics)
      .where(eq(playerStatistics.cycleId, cycleId))
      .orderBy(asc(playerStatistics.playerId));

    return result.map((stats) =>
      this.parseStatistics(stats),
    );
  }

  async getPlayerStatisticsByPlayer(
    playerId: number,
  ): Promise<PlayerStatistics[]> {
    const result = await db
      .select()
      .from(playerStatistics)
      .where(eq(playerStatistics.playerId, playerId))
      .orderBy(asc(playerStatistics.cycleId));

    return result.map((stats) =>
      this.parseStatistics(stats),
    );
  }

  async getPlayerStatisticsByTeam(
    cycleId: number,
    teamId: number,
  ): Promise<PlayerStatistics[]> {
    const result = await db
      .select({
        statistics: playerStatistics,
      })
      .from(playerStatistics)
      .innerJoin(
        players,
        eq(playerStatistics.playerId, players.id),
      )
      .where(
        and(
          eq(playerStatistics.cycleId, cycleId),
          eq(players.teamId, teamId),
        ),
      )
      .orderBy(
        asc(playerStatistics.playerId),
      );

    return result.map(({ statistics }) =>
      this.parseStatistics(statistics),
    );
  }

  async createPlayerStatistics(
    cycleId: number,
    playerId: number,
  ): Promise<PlayerStatistics> {
    const result = await db
      .insert(playerStatistics)
      .values({
        cycleId,
        playerId,
      })
      .returning();

    const statistics = result[0];

    if (!statistics) {
      throw new ErrorsUtil.CreationFailedError("Failed to create player statistics", 400);
    }

    return this.parseStatistics(statistics);
  }

  async updatePlayerStatistics(
    cycleId: number,
    playerId: number,
    data: Partial<
      Omit<PlayerStatistics, "playerId">
    >,
  ): Promise<PlayerStatistics | null> {
    const [statistics] = await db
      .update(playerStatistics)
      .set(data)
      .where(
        and(
          eq(playerStatistics.cycleId, cycleId),
          eq(playerStatistics.playerId, playerId),
        ),
      )
      .returning();

    return statistics
      ? this.parseStatistics(statistics)
      : null;
  }
}

export const statisticsService =
  new StatisticsService();