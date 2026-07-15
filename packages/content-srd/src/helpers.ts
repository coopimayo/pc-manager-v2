import type { Ability, Effect, Feature, ProficiencyType } from "@pc-manager/engine";

export function feature(id: string, name: string, text: string, effects?: Effect[]): Effect {
  return {
    kind: "grantFeature",
    feature: { id, name, text, ...(effects ? { effects } : {}) } satisfies Feature,
  };
}

export function prof(type: ProficiencyType, id: string): Effect {
  return { kind: "grantProficiency", proficiency: { type, id } };
}

export function profs(type: ProficiencyType, ids: string[]): Effect[] {
  return ids.map((id) => prof(type, id));
}

/** A "choose N skills from this list" decision. */
export function skillChoice(id: string, prompt: string, count: number, skillIds: string[]): Effect {
  return {
    kind: "grantDecision",
    decision: {
      id,
      prompt,
      count,
      options: {
        source: "list",
        options: skillIds.map((s) => ({
          id: s,
          label: s
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          effects: [prof("skill", s)],
        })),
      },
    },
  };
}

const ABILITY_NAMES: Record<Ability, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

/** "+1 to <ability>" options over the given abilities: used by background
 * ability increases (3 points, max +2 per ability) and ASI-style feats. */
export function abilityAllocation(
  id: string,
  prompt: string,
  abilities: Ability[],
  points: number,
  opts?: { maxPerAbility?: number; scoreMax?: number },
): Effect {
  return {
    kind: "grantDecision",
    decision: {
      id,
      prompt,
      count: points,
      allowDuplicates: true,
      ...(opts?.maxPerAbility !== undefined ? { maxPerOption: opts.maxPerAbility } : {}),
      options: {
        source: "list",
        options: abilities.map((a) => ({
          id: a,
          label: `+1 ${ABILITY_NAMES[a]}`,
          effects: [
            {
              kind: "abilityIncrease",
              ability: a,
              amount: 1,
              ...(opts?.scoreMax !== undefined ? { max: opts.scoreMax } : {}),
            },
          ],
        })),
      },
    },
  };
}
