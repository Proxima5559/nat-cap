import { matchService } from "../../services";
import { type CreateMatchInput, type MatchResponse  } from "../../dtos";

export const matchResolvers = {
  Query: {
    matches: () => matchService.getAllMatches(),

    match: (
      _: unknown,
      args: { id: number },
    ) => matchService.getMatchById(args.id),

    matchesByTournament: (
      _: unknown,
      args: { tournamentId: number },
    ) => matchService.getMatchesByTournament(args.tournamentId),

    matchesByTeam: (
      _: unknown,
      args: { teamId: number },
    ) => matchService.getMatchesByTeam(args.teamId),
  },

  Mutation: {
    createMatch: (
      _: unknown,
      args: { input: CreateMatchInput },
    ) : Promise<MatchResponse> => matchService.createMatch(args.input),

    startMatch: (
      _: unknown,
      args: { id: number },
    ) => matchService.startMatch(args.id),

    completeMatch: (
      _: unknown,
      args: {
        id: number;
        homeScore: number;
        awayScore: number;
      },
    ) =>
      matchService.completeMatch(
        args.id,
        args.homeScore,
        args.awayScore,
      ),
  },
};