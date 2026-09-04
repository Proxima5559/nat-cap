export interface GeneratedCompetition {
  name: string;
  region: string;
  type: string;
}

const COMPETITION_NAMES = [
  "African Championship",
  "European Championship",
  "Asian Championship",
  "North American Championship",
  "South American Championship",
  "Oceania Championship",
];

export class CompetitionGenerator {
  generate(region: string, name?: string): GeneratedCompetition {
    return {
      name: name ?? `${region} Championship`,
      region,
      type: "regional",
    };
  }
}

export const competitionGenerator = new CompetitionGenerator();