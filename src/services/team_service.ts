import { asc, eq, and } from "drizzle-orm";

import { db } from "../config/database";
import { teams, players, tournamentTeams } from "../database/schema";
import { ErrorsUtil } from "../utils";

import {
  teamResponseDto,
  type CreateTeamInput,
  type TeamResponse,
  playerResponseDto,
  type PlayerResponse,
  createTeamDto,
} from "../dtos/";


export class TeamService {
  async getAllTeams(): Promise<TeamResponse[]> {
    const result = await db
      .select()
      .from(teams)
      .orderBy(asc(teams.name));

    return result.map((team) => teamResponseDto.parse(team));
  }

  async getTeamById(id: number): Promise<TeamResponse | null> {
    const result = await db
      .select()
      .from(teams)
      .where(eq(teams.id, id))
      .limit(1);

    const team = result[0];

    if (!team) {
      return null;
    }

    return teamResponseDto.parse(team);
  }

  async getTeamsByRegion(
    region: CreateTeamInput["region"],
  ): Promise<TeamResponse[]> {
    const result = await db
      .select()
      .from(teams)
      .where(eq(teams.region, region))
      .orderBy(asc(teams.name));

    return result.map((team) => teamResponseDto.parse(team));
  }

  async getTeamPlayers(teamId: number): Promise<PlayerResponse[]> {
    const result = await db
      .select()
      .from(players)
      .where(eq(players.teamId, teamId))
      .orderBy(asc(players.name));

    return result.map((player) => playerResponseDto.parse(player));
  }

  async createTeam(input: CreateTeamInput): Promise<TeamResponse> {
    const validatedInput = createTeamDto.parse(input);

    const result = await db
      .insert(teams)
      .values({
        name: validatedInput.name,
        overall: validatedInput.overall,
        region: validatedInput.region,
      })
      .returning();

    const team = result[0];

    if (!team) {
      throw new ErrorsUtil.CreationFailedError("Failed to create team", 400);
    }

    return teamResponseDto.parse(team);
  }

  async getTeamTournaments(teamId: number) {
    return db.query.tournamentTeams.findMany({
      where: eq(tournamentTeams.teamId, teamId),
      with: {
        tournament: true,
      },
    });
  }

  async addTeamToTournament(
    teamId: number,
    tournamentId: number,
  ) {
    const existing = await db.query.tournamentTeams.findFirst({
      where: and(
        eq(tournamentTeams.teamId, teamId),
        eq(tournamentTeams.tournamentId, tournamentId),
      ),
    });

    if (existing) {
      throw new ErrorsUtil.ConflictError("Team is already registered in this tournament", 409);
    }

    const result = await db
      .insert(tournamentTeams)
      .values({
        teamId,
        tournamentId,
      })
      .returning();

    const tournamentTeam = result[0];

    if (!tournamentTeam) {
      throw new ErrorsUtil.CreationFailedError("Failed to add team to tournament", 400);
    }

    return tournamentTeam;
  }

  async removeTeamFromTournament(
    teamId: number,
    tournamentId: number,
  ) {
    const result = await db
      .delete(tournamentTeams)
      .where(
        and(
          eq(tournamentTeams.teamId, teamId),
          eq(tournamentTeams.tournamentId, tournamentId),
        ),
      )
      .returning();

    const tournamentTeam = result[0];

    if (!tournamentTeam) {
      throw new ErrorsUtil.NotFound("Team is not registered in this tournament", 404);
    }

    return tournamentTeam;
  }
}

export const teamService = new TeamService();