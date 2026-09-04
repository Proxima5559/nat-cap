import type { StrengthPlayer } from "./team-strength";

type PositionGroup = "GK" | "DEF" | "MID" | "FWD";

const POSITION_GROUPS: Record<PositionGroup, string[]> = {
  GK: ["GK"],
  DEF: ["SW", "CB", "LCB", "RCB", "LB", "RB", "LWB", "RWB"],
  MID: ["DM", "CDM", "CM", "LCM", "RCM", "LM", "RM", "AM", "CAM", "LWM", "RWM"],
  FWD: ["LW", "RW", "CF", "LF", "RF", "ST", "SS"],
};

export interface Formation {
  GK: number;
  DEF: number;
  MID: number;
  FWD: number;
}

export const DEFAULT_FORMATION: Formation = { GK: 1, DEF: 4, MID: 4, FWD: 2 };

export interface Lineup {
  starters: StrengthPlayer[];
  bench: StrengthPlayer[];
}

function byAbilityDesc(a: StrengthPlayer, b: StrengthPlayer): number {
  return b.ability - a.ability;
}

export function selectLineup(
  squad: StrengthPlayer[],
  formation: Formation = DEFAULT_FORMATION,
): Lineup {
  if (squad.length === 0) {
    return { starters: [], bench: [] };
  }

  const remaining = new Set(squad);
  const starters: StrengthPlayer[] = [];

  (Object.keys(POSITION_GROUPS) as PositionGroup[]).forEach((group) => {
    const need = formation[group];
    const eligible = [...remaining]
      .filter((player) => POSITION_GROUPS[group].includes(player.position))
      .sort(byAbilityDesc);

    for (const player of eligible.slice(0, need)) {
      starters.push(player);
      remaining.delete(player);
    }
  });

  const targetSize = Math.min(
    squad.length,
    formation.GK + formation.DEF + formation.MID + formation.FWD,
  );

  if (starters.length < targetSize) {
    const fillers = [...remaining].sort(byAbilityDesc);

    for (const player of fillers) {
      if (starters.length >= targetSize) {
        break;
      }

      starters.push(player);
      remaining.delete(player);
    }
  }

  return {
    starters,
    bench: [...remaining].sort(byAbilityDesc),
  };
}
