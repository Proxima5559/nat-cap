import { asc, eq } from "drizzle-orm";

import { db } from "../config/database";
import {
  competitions,
  tournaments,
} from "../database/schema";

import {
  competitionResponseDto,
  createCompetitionDto,
  type CompetitionResponse,
  type CreateCompetitionInput,
} from "../dtos";

export class CompetitionService {
  async getAllCompetitions(): Promise<CompetitionResponse[]> {
    const result = await db
      .select()
      .from(competitions)
      .orderBy(asc(competitions.name));

    return result.map((competition) =>
      competitionResponseDto.parse(competition),
    );
  }

  async getCompetitionById(
    id: number,
  ): Promise<CompetitionResponse | null> {
    const result = await db
      .select()
      .from(competitions)
      .where(eq(competitions.id, id))
      .limit(1);

    const competition = result[0];

    if (!competition) {
      return null;
    }

    return competitionResponseDto.parse(competition);
  }

  async getCompetitionsByRegion(
    region: CreateCompetitionInput["region"],
  ): Promise<CompetitionResponse[]> {
    const result = await db
      .select()
      .from(competitions)
      .where(eq(competitions.region, region))
      .orderBy(asc(competitions.name));

    return result.map((competition) =>
      competitionResponseDto.parse(competition),
    );
  }

  async getCompetitionTournaments(
    competitionId: number,
  ) {
    return await db
      .select()
      .from(tournaments)
      .where(
        eq(tournaments.competitionId, competitionId),
      )
      .orderBy(asc(tournaments.name));
  }

  async createCompetition(
    input: CreateCompetitionInput,
  ): Promise<CompetitionResponse> {
    const validatedInput =
      createCompetitionDto.parse(input);

    const result = await db
      .insert(competitions)
      .values({
        name: validatedInput.name,
        region: validatedInput.region,
        type: validatedInput.type,
      })
      .returning();

    const competition = result[0];

    if (!competition) {
      throw new Error(
        "Failed to create competition",
      );
    }

    return competitionResponseDto.parse(competition);
  }
}

export const competitionService =
  new CompetitionService();