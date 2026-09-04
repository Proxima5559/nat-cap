import { and, asc, eq } from "drizzle-orm";

import { db } from "../config/database";
import {
  tournaments,
  tournamentTeams,
  teams,
} from "../database/schema";

import { ErrorsUtil } from "../utils";
import {
  createTournamentDto,
  tournamentResponseDto,
  type CreateTournamentInput,
  type TournamentResponse,
} from "../dtos";

export class TournamentService {
  async getAllTournaments(): Promise<TournamentResponse[]> {
    const result = await db
      .select()
      .from(tournaments)
      .orderBy(asc(tournaments.name));

    return result.map((tournament) =>
      tournamentResponseDto.parse(tournament),
    );
  }

  async getTournamentById(
    id: number,
  ): Promise<TournamentResponse | null> {
    const result = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, id))
      .limit(1);

    const tournament = result[0];

    if (!tournament) {
      return null;
    }

    return tournamentResponseDto.parse(tournament);
  }

  async getTournamentsByCycle(
    cycleId: number,
  ): Promise<TournamentResponse[]> {
    const result = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.cycleId, cycleId))
      .orderBy(asc(tournaments.name));

    return result.map((tournament) =>
      tournamentResponseDto.parse(tournament),
    );
  }

  async getTournamentsByCompetition(
    competitionId: number,
  ): Promise<TournamentResponse[]> {
    const result = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.competitionId, competitionId))
      .orderBy(asc(tournaments.name));

    return result.map((tournament) =>
      tournamentResponseDto.parse(tournament),
    );
  }

  async createTournament(
    input: CreateTournamentInput,
  ): Promise<TournamentResponse> {
    const validatedInput = createTournamentDto.parse(input);

    const result = await db
      .insert(tournaments)
      .values({
        cycleId: validatedInput.cycleId,
        competitionId: validatedInput.competitionId,
        name: validatedInput.name,
        status: "created",
        startedAt: null,
        completedAt: null,
      })
      .returning();

    const tournament = result[0];

    if (!tournament) {
      throw new ErrorsUtil.CreationFailedError("Failed to create tournament", 400);
    }

    return tournamentResponseDto.parse(tournament);
  }

  async getTournamentTeams(tournamentId: number) {
    return await db
      .select({
        tournamentId: tournamentTeams.tournamentId,
        teamId: tournamentTeams.teamId,
        team: teams,
      })
      .from(tournamentTeams)
      .innerJoin(
        teams,
        eq(tournamentTeams.teamId, teams.id),
      )
      .where(
        eq(tournamentTeams.tournamentId, tournamentId),
      )
      .orderBy(asc(teams.name));
  }

  async addTeamToTournament(
    tournamentId: number,
    teamId: number,
  ): Promise<void> {
    const existing = await db
      .select()
      .from(tournamentTeams)
      .where(
        and(
          eq(tournamentTeams.tournamentId, tournamentId),
          eq(tournamentTeams.teamId, teamId),
        ),
      )
      .limit(1);

    if (existing[0]) {
      throw new ErrorsUtil.ConflictError("Team is already registered in this tournament", 409);
    }

    await db
      .insert(tournamentTeams)
      .values({
        tournamentId,
        teamId,
      });
  }

  async removeTeamFromTournament(
    tournamentId: number,
    teamId: number,
  ): Promise<void> {
    await db
      .delete(tournamentTeams)
      .where(
        and(
          eq(tournamentTeams.tournamentId, tournamentId),
          eq(tournamentTeams.teamId, teamId),
        ),
      );
  }

  async getTournamentDetails(tournamentId: number) {
    const tournament = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, tournamentId))
      .limit(1);

    const result = tournament[0];

    if (!result) {
      return null;
    }

    const tournamentTeamRows =
      await this.getTournamentTeams(tournamentId);

    return {
      tournament: tournamentResponseDto.parse(result),
      teams: tournamentTeamRows,
    };
  }

  async startTournament(
    id: number,
  ): Promise<TournamentResponse | null> {
    const result = await db
      .update(tournaments)
      .set({
        status: "running",
        startedAt: new Date(),
      })
      .where(eq(tournaments.id, id))
      .returning();

    const tournament = result[0];

    if (!tournament) {
      return null;
    }

    return tournamentResponseDto.parse(tournament);
  }

  async completeTournament(
    id: number,
  ): Promise<TournamentResponse | null> {
    const result = await db
      .update(tournaments)
      .set({
        status: "completed",
        completedAt: new Date(),
      })
      .where(eq(tournaments.id, id))
      .returning();

    const tournament = result[0];

    if (!tournament) {
      return null;
    }

    return tournamentResponseDto.parse(tournament);
  }
}

export const tournamentService = new TournamentService();