/**
 * Backgrounds (SRD 5.2, 2024 rules). Each grants: +3 ability points across its
 * three abilities (max +2 to one), two skill proficiencies, a tool proficiency,
 * and a fixed Origin feat. Equipment arrives with the equipment milestone.
 */
import type { Ability, Entity } from "@pc-manager/engine";
import { abilityAllocation, prof } from "./helpers.js";

function background(
  id: string,
  name: string,
  abilities: [Ability, Ability, Ability],
  skills: [string, string],
  tool: string,
  featId: string,
): Entity {
  return {
    type: "background",
    id,
    name,
    effects: [
      abilityAllocation(
        `${id}:abilities`,
        `${name}: +2 to one ability and +1 to another, or +1 to all three`,
        abilities,
        3,
        { maxPerAbility: 2, scoreMax: 20 },
      ),
      prof("skill", skills[0]),
      prof("skill", skills[1]),
      prof("tool", tool),
      // TODO(M4): backgrounds grant a *specific* Magic Initiate list (Acolyte →
      // Cleric, Sage → Wizard), but grantFeat can't yet pre-resolve the feat's
      // spell-list decision, so the player currently picks the list freely.
      { kind: "grantFeat", featId },
    ],
  };
}

export const backgrounds: Entity[] = [
  background("acolyte", "Acolyte", ["int", "wis", "cha"], ["insight", "religion"], "calligraphers-supplies", "magic-initiate"),
  background("criminal", "Criminal", ["dex", "con", "int"], ["sleight-of-hand", "stealth"], "thieves-tools", "alert"),
  background("sage", "Sage", ["con", "int", "wis"], ["arcana", "history"], "calligraphers-supplies", "magic-initiate"),
  background("soldier", "Soldier", ["str", "dex", "con"], ["athletics", "intimidation"], "gaming-set", "savage-attacker"),
];
