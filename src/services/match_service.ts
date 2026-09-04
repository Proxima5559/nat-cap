import { asc, eq, or } from "drizzle-orm";

import { db } from "../config/database";
import {
  matches,
  matchEvents,
} from "../database/schema";
import { ErrorsUtil } from "../utils";
import {
  createMatchDto,
  matchResponseDto,
  type CreateMatchInput,
  type MatchResponse,
} from "../dtos";

export class MatchService {
  async getAllMatches(): Promise<MatchResponse[]> {
    const result = await db
      .select()
      .from(matches)
      .orderBy(asc(matches.id));

    return result.map((match) =>
      matchResponseDto.parse(match),
    );
  }

  async getMatchById(
    id: number,
  ): Promise<MatchResponse | null> {
    const result = await db
      .select()
      .from(matches)
      .where(eq(matches.id, id))
      .limit(1);

    const match = result[0];

    if (!match) {
      return null;
    }

    return matchResponseDto.parse(match);
  }

  async getMatchesByTournament(
    tournamentId: number,
  ): Promise<MatchResponse[]> {
    const result = await db
      .select()
      .from(matches)
      .where(eq(matches.tournamentId, tournamentId))
      .orderBy(asc(matches.id));

    return result.map((match) =>
      matchResponseDto.parse(match),
    );
  }

  async getMatchesByTeam(
    teamId: number,
  ): Promise<MatchResponse[]> {
    const result = await db
      .select()
      .from(matches)
      .where(
        or(
          eq(matches.homeTeamId, teamId),
          eq(matches.awayTeamId, teamId),
        ),
      )
      .orderBy(asc(matches.id));

    return result.map((match) =>
      matchResponseDto.parse(match),
    );
  }

  async getMatchEvents(matchId: number) {
    return await db
      .select()
      .from(matchEvents)
      .where(eq(matchEvents.matchId, matchId))
      .orderBy(asc(matchEvents.id));
  }

  async createMatch(
    input: CreateMatchInput,
  ): Promise<MatchResponse> {
    const validatedInput = createMatchDto.parse(input);

    if (
      validatedInput.homeTeamId ===
      validatedInput.awayTeamId
    ) {
      throw new ErrorsUtil.ValidationError(
        "Home team and away team cannot be the same",
        400,
      );
    }

    const result = await db
      .insert(matches)
      .values({
        tournamentId: validatedInput.tournamentId,
        homeTeamId: validatedInput.homeTeamId,
        awayTeamId: validatedInput.awayTeamId,
        homeScore: null,
        awayScore: null,
        status: "scheduled",
        playedAt: null,
      })
      .returning();

    const match = result[0];

    if (!match) {
      throw new ErrorsUtil.CreationFailedError("Failed to create match", 400);
    }

    return matchResponseDto.parse(match);
  }

  async startMatch(
    id: number,
  ): Promise<MatchResponse | null> {
    const result = await db
      .update(matches)
      .set({
        status: "live",
      })
      .where(eq(matches.id, id))
      .returning();

    const match = result[0];

    if (!match) {
      return null;
    }

    return matchResponseDto.parse(match);
  }

  async completeMatch(
    id: number,
    homeScore: number,
    awayScore: number,
  ): Promise<MatchResponse | null> {
    if (
      !Number.isInteger(homeScore) ||
      !Number.isInteger(awayScore) ||
      homeScore < 0 ||
      awayScore < 0
    ) {
      throw new ErrorsUtil.ValidationError(
        "Scores must be non-negative integers",
        400,
      );
    }

    const result = await db
      .update(matches)
      .set({
        homeScore,
        awayScore,
        status: "completed",
        playedAt: new Date(),
      })
      .where(eq(matches.id, id))
      .returning();

    const match = result[0];

    if (!match) {
      return null;
    }

    return matchResponseDto.parse(match);
  }
}

export const matchService = new MatchService();