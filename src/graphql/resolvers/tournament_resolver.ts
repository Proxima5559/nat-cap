import { tournamentService } from "../../services";
import { type CreateTournamentInput } from "../../dtos";

export const tournamentResolvers = {
  Query: {
    tournaments: () => tournamentService.getAllTournaments(),

    tournament: (
      _: unknown,
      args: { id: number },
    ) => tournamentService.getTournamentById(args.id),

    tournamentsByCycle: (
      _: unknown,
      args: { cycleId: number },
    ) => tournamentService.getTournamentsByCycle(args.cycleId),

    tournamentsByCompetition: (
      _: unknown,
      args: { competitionId: number },
    ) =>
      tournamentService.getTournamentsByCompetition(
        args.competitionId,
      ),
  },

  Mutation: {
    createTournament: (
      _: unknown,
        args: { input: CreateTournamentInput },
    ) => tournamentService.createTournament(args.input),

    addTeamToTournament: (
      _: unknown,
      args: {
        tournamentId: number;
        teamId: number;
      },
    ) =>
      tournamentService.addTeamToTournament(
        args.tournamentId,
        args.teamId,
      ),

    removeTeamFromTournament: (
      _: unknown,
      args: {
        tournamentId: number;
        teamId: number;
      },
    ) =>
      tournamentService.removeTeamFromTournament(
        args.tournamentId,
        args.teamId,
      ),

    startTournament: (
      _: unknown,
      args: { id: number },
    ) => tournamentService.startTournament(args.id),

    completeTournament: (
      _: unknown,
      args: { id: number },
    ) => tournamentService.completeTournament(args.id),
  },
};