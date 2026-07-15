/**
 * Feats (SRD 5.2, 2024 rules), paraphrased mechanics.
 * Combat mechanics the engine can't express yet (attack-roll riders, rerolls)
 * are feature text; numeric effects (initiative, AC, ability increases) are real.
 */
import type { Entity } from "@pc-manager/engine";
import { abilityAllocation, feature, skillChoice } from "./helpers.js";

export const feats: Entity[] = [
  // --- Origin feats ---
  {
    type: "feat",
    id: "alert",
    name: "Alert",
    category: "origin",
    description:
      "Add your Proficiency Bonus to Initiative rolls. When you roll Initiative, you can swap your roll with a willing ally's.",
    effects: [{ kind: "modifyStat", stat: "initiative", delta: "profBonus" }],
  },
  {
    type: "feat",
    id: "magic-initiate",
    name: "Magic Initiate",
    category: "origin",
    repeatable: true,
    description:
      "You learn two cantrips and one level 1 spell from the Cleric, Druid, or Wizard spell list.",
    effects: [
      {
        kind: "grantDecision",
        decision: {
          id: "magic-initiate:list",
          prompt: "Magic Initiate: choose a spell list",
          count: 1,
          options: {
            source: "list",
            options: (["Cleric", "Druid", "Wizard"] as const).map((list) => ({
              id: list.toLowerCase(),
              label: `${list} spell list`,
              effects: [
                feature(
                  `magic-initiate:${list.toLowerCase()}`,
                  `Magic Initiate (${list})`,
                  `Two cantrips and one level 1 spell from the ${list} spell list. (Spell selection arrives with the spells milestone.)`,
                ),
              ],
            })),
          },
        },
      },
    ],
  },
  {
    type: "feat",
    id: "savage-attacker",
    name: "Savage Attacker",
    category: "origin",
    description:
      "Once per turn when you hit a target with a weapon, you can roll the weapon's damage dice twice and use either roll.",
    effects: [],
  },
  {
    type: "feat",
    id: "skilled",
    name: "Skilled",
    category: "origin",
    repeatable: true,
    description: "You gain proficiency in any combination of three skills or tools of your choice.",
    effects: [
      skillChoice("skilled:choice", "Skilled: choose three skills", 3, [
        "acrobatics", "animal-handling", "arcana", "athletics", "deception", "history",
        "insight", "intimidation", "investigation", "medicine", "nature", "perception",
        "performance", "persuasion", "religion", "sleight-of-hand", "stealth", "survival",
      ]),
    ],
  },

  // --- General feats ---
  {
    type: "feat",
    id: "ability-score-improvement",
    name: "Ability Score Improvement",
    category: "general",
    repeatable: true,
    prerequisite: { type: "characterLevelAtLeast", level: 4 },
    description: "Increase one ability score by 2, or two ability scores by 1 (maximum 20).",
    effects: [
      abilityAllocation(
        "asi:allocate",
        "Increase one ability by 2, or two abilities by 1",
        ["str", "dex", "con", "int", "wis", "cha"],
        2,
        { maxPerAbility: 2, scoreMax: 20 },
      ),
    ],
  },
  {
    type: "feat",
    id: "grappler",
    name: "Grappler",
    category: "general",
    prerequisite: {
      type: "any",
      predicates: [
        { type: "abilityAtLeast", ability: "str", value: 13 },
        { type: "abilityAtLeast", ability: "dex", value: 13 },
      ],
    },
    description:
      "Increase your Strength or Dexterity by 1. You deal extra damage to creatures you grapple and grapple more effectively.",
    effects: [
      abilityAllocation("grappler:ability", "Grappler: +1 Strength or Dexterity", ["str", "dex"], 1, {
        scoreMax: 20,
      }),
    ],
  },

  // --- Fighting Style feats ---
  {
    type: "feat",
    id: "fs-archery",
    name: "Archery",
    category: "fighting-style",
    description: "+2 bonus to attack rolls you make with Ranged weapons.",
    effects: [],
  },
  {
    type: "feat",
    id: "fs-defense",
    name: "Defense",
    category: "fighting-style",
    description: "While you are wearing Light, Medium, or Heavy armor, you gain a +1 bonus to Armor Class.",
    effects: [{ kind: "modifyStat", stat: "ac", delta: "1" }],
  },
  {
    type: "feat",
    id: "fs-great-weapon-fighting",
    name: "Great Weapon Fighting",
    category: "fighting-style",
    description:
      "When you roll damage for an attack with a Melee weapon held in two hands, treat any 1 or 2 on a damage die as a 3.",
    effects: [],
  },
  {
    type: "feat",
    id: "fs-two-weapon-fighting",
    name: "Two-Weapon Fighting",
    category: "fighting-style",
    description:
      "When you make the extra attack of the Light weapon property, you can add your ability modifier to the damage of that attack.",
    effects: [],
  },

  // --- Epic Boon feats ---
  {
    type: "feat",
    id: "boon-of-combat-prowess",
    name: "Boon of Combat Prowess",
    category: "epic-boon",
    prerequisite: { type: "characterLevelAtLeast", level: 19 },
    description:
      "Increase one ability score by 1 (maximum 30). Once per turn when you miss with an attack roll, you can hit instead.",
    effects: [
      abilityAllocation("boon-combat-prowess:ability", "Epic Boon: +1 to one ability (max 30)", [
        "str", "dex", "con", "int", "wis", "cha",
      ], 1, { scoreMax: 30 }),
    ],
  },
];
