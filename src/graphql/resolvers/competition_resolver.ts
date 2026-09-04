import { competitionService } from "../../services";
import { type CreateCompetitionInput } from "../../dtos"

export const competitionResolvers = {
  Query: {
    competitions: () => competitionService.getAllCompetitions(),

    competition: (
      _: unknown,
      args: { id: number },
    ) => competitionService.getCompetitionById(args.id),

    competitionsByRegion: (
      _: unknown,
      args: { region: CreateCompetitionInput["region"] },
    ) => competitionService.getCompetitionsByRegion(args.region),
  },

  Mutation: {
    createCompetition: (
      _: unknown,
    args: { input: CreateCompetitionInput },

    ) => competitionService.createCompetition(args.input),
  },
};