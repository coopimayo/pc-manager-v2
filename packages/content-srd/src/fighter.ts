/**
 * Fighter class + Champion subclass (SRD 5.2, 2024 rules), paraphrased.
 * The M1 vertical-slice class: full levels 1–20 as pure data. Weapon Mastery
 * details await the equipment milestone (feature text until then).
 */
import type { Effect, Entity } from "@pc-manager/engine";
import { feature, profs, skillChoice } from "./helpers.js";

/** "Gain a feat" slot (2024 ASI levels grant a General feat of your choice). */
function generalFeatSlot(id: string): Effect {
  return {
    kind: "grantDecision",
    decision: {
      id,
      prompt: "Choose a General feat (Ability Score Improvement or another you qualify for)",
      count: 1,
      options: { source: "query", entityType: "feat", filter: { category: "general" } },
    },
  };
}

function fightingStyleChoice(id: string): Effect {
  return {
    kind: "grantDecision",
    decision: {
      id,
      prompt: "Choose a Fighting Style feat",
      count: 1,
      options: { source: "query", entityType: "feat", filter: { category: "fighting-style" } },
    },
  };
}

export const fighter: Entity = {
  type: "class",
  id: "fighter",
  name: "Fighter",
  hitDie: 10,
  primaryAbilities: ["str", "dex"],
  multiclassPrerequisite: {
    type: "any",
    predicates: [
      { type: "abilityAtLeast", ability: "str", value: 13 },
      { type: "abilityAtLeast", ability: "dex", value: 13 },
    ],
  },
  levels: {
    1: {
      effects: [
        ...profs("savingThrow", ["str", "con"]),
        ...profs("armor", ["light-armor", "medium-armor", "heavy-armor", "shields"]),
        ...profs("weapon", ["simple-weapons", "martial-weapons"]),
        skillChoice("fighter:skills", "Fighter: choose two skills", 2, [
          "acrobatics", "animal-handling", "athletics", "history", "insight",
          "intimidation", "persuasion", "perception", "survival",
        ]),
        feature(
          "fighter:fighting-style",
          "Fighting Style",
          "You gain a Fighting Style feat of your choice.",
          [fightingStyleChoice("fighter:fighting-style:choice")],
        ),
        feature(
          "fighter:second-wind",
          "Second Wind",
          "As a Bonus Action, regain 1d10 + your Fighter level Hit Points. 2 uses; regain one on Short Rest, all on Long Rest.",
        ),
        feature(
          "fighter:weapon-mastery",
          "Weapon Mastery",
          "You can use the mastery properties of three kinds of weapons of your choice. (Weapon selection arrives with the equipment milestone.)",
        ),
      ],
    },
    2: {
      effects: [
        feature(
          "fighter:action-surge",
          "Action Surge",
          "Take one additional action on your turn (not the Magic action). Once per Short or Long Rest.",
        ),
        feature(
          "fighter:tactical-mind",
          "Tactical Mind",
          "When you fail an ability check, expend a use of Second Wind to add 1d10 to the check instead of regaining Hit Points.",
        ),
      ],
    },
    3: {
      effects: [
        {
          kind: "grantDecision",
          decision: {
            id: "fighter:subclass",
            prompt: "Choose your Fighter subclass",
            count: 1,
            options: { source: "query", entityType: "subclass", filter: { classId: "fighter" } },
          },
        },
      ],
    },
    4: { effects: [generalFeatSlot("fighter:feat-4")] },
    5: {
      effects: [
        feature(
          "fighter:extra-attack",
          "Extra Attack",
          "You can attack twice, instead of once, whenever you take the Attack action on your turn.",
        ),
        feature(
          "fighter:tactical-shift",
          "Tactical Shift",
          "When you activate Second Wind with a Bonus Action, you can move up to half your Speed without provoking Opportunity Attacks.",
        ),
      ],
    },
    6: { effects: [generalFeatSlot("fighter:feat-6")] },
    7: { effects: [] },
    8: { effects: [generalFeatSlot("fighter:feat-8")] },
    9: {
      effects: [
        feature(
          "fighter:indomitable",
          "Indomitable",
          "When you fail a saving throw, reroll it with a bonus equal to your Fighter level. Once per Long Rest.",
        ),
        feature(
          "fighter:tactical-master",
          "Tactical Master",
          "When you attack with a weapon whose mastery property you can use, you can replace that property with Push, Sap, or Slow.",
        ),
      ],
    },
    10: { effects: [] },
    11: {
      effects: [
        feature(
          "fighter:two-extra-attacks",
          "Two Extra Attacks",
          "You can attack three times whenever you take the Attack action on your turn.",
        ),
      ],
    },
    12: { effects: [generalFeatSlot("fighter:feat-12")] },
    13: {
      effects: [
        feature(
          "fighter:indomitable-2",
          "Indomitable (two uses)",
          "You can use Indomitable twice per Long Rest.",
        ),
        feature(
          "fighter:studied-attacks",
          "Studied Attacks",
          "If you miss a creature with an attack roll, you have Advantage on your next attack roll against it before the end of your next turn.",
        ),
      ],
    },
    14: { effects: [generalFeatSlot("fighter:feat-14")] },
    15: { effects: [] },
    16: { effects: [generalFeatSlot("fighter:feat-16")] },
    17: {
      effects: [
        feature(
          "fighter:action-surge-2",
          "Action Surge (two uses)",
          "You can use Action Surge twice before a rest, but only once on a turn.",
        ),
        feature(
          "fighter:indomitable-3",
          "Indomitable (three uses)",
          "You can use Indomitable three times per Long Rest.",
        ),
      ],
    },
    18: { effects: [] },
    19: {
      effects: [
        {
          kind: "grantDecision",
          decision: {
            id: "fighter:epic-boon",
            prompt: "Choose an Epic Boon feat",
            count: 1,
            options: { source: "query", entityType: "feat", filter: { category: "epic-boon" } },
          },
        },
      ],
    },
    20: {
      effects: [
        feature(
          "fighter:three-extra-attacks",
          "Three Extra Attacks",
          "You can attack four times whenever you take the Attack action on your turn.",
        ),
      ],
    },
  },
};

export const champion: Entity = {
  type: "subclass",
  id: "champion",
  name: "Champion",
  classId: "fighter",
  levels: {
    3: {
      effects: [
        feature(
          "champion:improved-critical",
          "Improved Critical",
          "Your attack rolls with weapons and Unarmed Strikes score a Critical Hit on a roll of 19 or 20 on the d20.",
        ),
        feature(
          "champion:remarkable-athlete",
          "Remarkable Athlete",
          "You have Advantage on Initiative rolls and Strength (Athletics) checks; after scoring a Critical Hit, you can move up to half your Speed without provoking Opportunity Attacks.",
        ),
      ],
    },
    7: {
      effects: [
        feature(
          "champion:additional-fighting-style",
          "Additional Fighting Style",
          "You gain another Fighting Style feat of your choice.",
          [
            {
              kind: "grantDecision",
              decision: {
                id: "champion:fighting-style:choice",
                prompt: "Additional Fighting Style: choose a Fighting Style feat",
                count: 1,
                options: {
                  source: "query",
                  entityType: "feat",
                  filter: { category: "fighting-style" },
                },
              },
            },
          ],
        ),
      ],
    },
    10: {
      effects: [
        feature(
          "champion:heroic-warrior",
          "Heroic Warrior",
          "During combat, you can give yourself Heroic Inspiration at the start of your turn if you don't have it.",
        ),
      ],
    },
    15: {
      effects: [
        feature(
          "champion:superior-critical",
          "Superior Critical",
          "Your attack rolls with weapons and Unarmed Strikes score a Critical Hit on a roll of 18–20 on the d20.",
        ),
      ],
    },
    18: {
      effects: [
        feature(
          "champion:survivor",
          "Survivor",
          "You have Advantage on Death Saving Throws, and at the start of each of your turns you regain Hit Points if you are bloodied (Heroic Rally).",
        ),
      ],
    },
  },
};
