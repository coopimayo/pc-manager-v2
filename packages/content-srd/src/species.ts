/**
 * Species & subspecies (SRD 5.2, 2024 rules), paraphrased mechanics.
 * Initial subset: Human, Elf (+3 lineages as subspecies), Dwarf, Halfling, Orc.
 * Remaining SRD species (Dragonborn, Gnome, Goliath, Tiefling) land in M4.
 * Spell grants (lineage cantrips, etc.) are feature text until spells land in M5.
 */
import type { Entity } from "@pc-manager/engine";
import { feature, skillChoice } from "./helpers.js";

export const species: Entity[] = [
  {
    type: "species",
    id: "human",
    name: "Human",
    effects: [
      { kind: "setStat", stat: "speed", value: "30" },
      feature(
        "human:resourceful",
        "Resourceful",
        "You gain Heroic Inspiration whenever you finish a Long Rest.",
      ),
      feature("human:skillful", "Skillful", "You gain proficiency in one skill of your choice.", [
        skillChoice("human:skillful:choice", "Skillful: choose one skill", 1, [
          "acrobatics", "animal-handling", "arcana", "athletics", "deception", "history",
          "insight", "intimidation", "investigation", "medicine", "nature", "perception",
          "performance", "persuasion", "religion", "sleight-of-hand", "stealth", "survival",
        ]),
      ]),
      feature("human:versatile", "Versatile", "You gain an Origin feat of your choice.", [
        {
          kind: "grantDecision",
          decision: {
            id: "human:versatile:feat",
            prompt: "Versatile: choose an Origin feat",
            count: 1,
            options: { source: "query", entityType: "feat", filter: { category: "origin" } },
          },
        },
      ]),
    ],
  },
  {
    type: "species",
    id: "elf",
    name: "Elf",
    effects: [
      { kind: "setStat", stat: "speed", value: "30" },
      { kind: "setStat", stat: "darkvision", value: "60" },
      feature(
        "elf:fey-ancestry",
        "Fey Ancestry",
        "You have Advantage on saving throws you make to avoid or end the Charmed condition.",
      ),
      feature(
        "elf:keen-senses",
        "Keen Senses",
        "You have proficiency in Insight, Perception, or Survival.",
        [
          skillChoice("elf:keen-senses:choice", "Keen Senses: choose one skill", 1, [
            "insight", "perception", "survival",
          ]),
        ],
      ),
      feature(
        "elf:trance",
        "Trance",
        "You don't need to sleep; you can finish a Long Rest in 4 hours of trance.",
      ),
      {
        kind: "grantDecision",
        decision: {
          id: "elf:lineage",
          prompt: "Choose your Elven Lineage",
          count: 1,
          options: { source: "query", entityType: "subspecies", filter: { speciesId: "elf" } },
        },
      },
    ],
  },
  {
    type: "subspecies",
    id: "elf-drow",
    name: "Drow",
    speciesId: "elf",
    effects: [
      { kind: "setStat", stat: "darkvision", value: "120" },
      feature(
        "elf-drow:lineage",
        "Drow Lineage",
        "You know the Dancing Lights cantrip. At higher levels you gain Faerie Fire and Darkness. (Spellcasting arrives in a later milestone.)",
      ),
    ],
  },
  {
    type: "subspecies",
    id: "elf-high",
    name: "High Elf",
    speciesId: "elf",
    effects: [
      feature(
        "elf-high:lineage",
        "High Elf Lineage",
        "You know the Prestidigitation cantrip. At higher levels you gain Detect Magic and Misty Step. (Spellcasting arrives in a later milestone.)",
      ),
    ],
  },
  {
    type: "subspecies",
    id: "elf-wood",
    name: "Wood Elf",
    speciesId: "elf",
    effects: [
      { kind: "setStat", stat: "speed", value: "35" },
      feature(
        "elf-wood:lineage",
        "Wood Elf Lineage",
        "You know the Druidcraft cantrip. At higher levels you gain Longstrider and Pass Without Trace. (Spellcasting arrives in a later milestone.)",
      ),
    ],
  },
  {
    type: "species",
    id: "dwarf",
    name: "Dwarf",
    effects: [
      { kind: "setStat", stat: "speed", value: "30" },
      { kind: "setStat", stat: "darkvision", value: "120" },
      feature(
        "dwarf:resilience",
        "Dwarven Resilience",
        "You have Resistance to Poison damage and Advantage on saving throws to avoid or end the Poisoned condition.",
      ),
      feature(
        "dwarf:toughness",
        "Dwarven Toughness",
        "Your Hit Point maximum increases by 1 for each level you have.",
        [{ kind: "modifyStat", stat: "hp", delta: "level" }],
      ),
      feature(
        "dwarf:stonecunning",
        "Stonecunning",
        "As a Bonus Action, you gain Tremorsense with a range of 60 feet for 10 minutes while on a stone surface.",
      ),
    ],
  },
  {
    type: "species",
    id: "halfling",
    name: "Halfling",
    effects: [
      { kind: "setStat", stat: "speed", value: "30" },
      feature(
        "halfling:brave",
        "Brave",
        "You have Advantage on saving throws you make to avoid or end the Frightened condition.",
      ),
      feature(
        "halfling:nimbleness",
        "Halfling Nimbleness",
        "You can move through the space of any creature that is of a size larger than you.",
      ),
      feature(
        "halfling:luck",
        "Luck",
        "When you roll a 1 on the d20 of a D20 Test, you can reroll the die, and you must use the new roll.",
      ),
      feature(
        "halfling:naturally-stealthy",
        "Naturally Stealthy",
        "You can take the Hide action even when obscured only by a creature at least one size larger than you.",
      ),
    ],
  },
  {
    type: "species",
    id: "orc",
    name: "Orc",
    effects: [
      { kind: "setStat", stat: "speed", value: "30" },
      { kind: "setStat", stat: "darkvision", value: "120" },
      feature(
        "orc:adrenaline-rush",
        "Adrenaline Rush",
        "You can take the Dash action as a Bonus Action; when you do, you gain Temporary Hit Points equal to your Proficiency Bonus.",
      ),
      feature(
        "orc:relentless-endurance",
        "Relentless Endurance",
        "When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead (once per Long Rest).",
      ),
    ],
  },
];
