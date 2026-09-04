import type { CreateMatchInput } from "../dtos";
import type { Fixture } from "./fixture_generator";

export class MatchGenerator {
  generate(fixtures: Fixture[], tournamentId: number): CreateMatchInput[] {
    return fixtures
      .filter((fixture): fixture is Fixture & { awayTeamId: number } => fixture.awayTeamId !== null)
      .map((fixture) => ({
        tournamentId,
        homeTeamId: fixture.homeTeamId,
        awayTeamId: fixture.awayTeamId,
      }));
  }
}

export const matchGenerator = new MatchGenerator();
