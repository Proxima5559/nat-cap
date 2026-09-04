export interface GeneratedTournament {
  name: string;
  status: "created";
}

export class TournamentGenerator {
  generate(name: string): GeneratedTournament {
    return {
      name,
      status: "created",
    };
  }
}

export const tournamentGenerator = new TournamentGenerator();