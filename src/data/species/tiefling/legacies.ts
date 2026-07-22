import type { Subspecies } from '../../../types/species';

const fiendishLegacies: {
  id: string;
  name: string;
  resistance: string;
  cantripId: string;
  cantripName: string;
  level3Id: string;
  level3Name: string;
  level5Id: string;
  level5Name: string;
}[] = [
  {
    id: 'abyssal',
    name: 'Abyssal',
    resistance: 'Poison',
    cantripId: 'poison-spray',
    cantripName: 'Poison Spray',
    level3Id: 'ray-of-sickness',
    level3Name: 'Ray of Sickness',
    level5Id: 'hold-person',
    level5Name: 'Hold Person',
  },
  {
    id: 'chthonic',
    name: 'Chthonic',
    resistance: 'Necrotic',
    cantripId: 'chill-touch',
    cantripName: 'Chill Touch',
    level3Id: 'false-life',
    level3Name: 'False Life',
    level5Id: 'ray-of-enfeeblement',
    level5Name: 'Ray of Enfeeblement',
  },
  {
    id: 'infernal',
    name: 'Infernal',
    resistance: 'Fire',
    cantripId: 'fire-bolt',
    cantripName: 'Fire Bolt',
    level3Id: 'hellish-rebuke',
    level3Name: 'Hellish Rebuke',
    level5Id: 'darkness',
    level5Name: 'Darkness',
  },
];

export const tieflingSubspecies: Subspecies[] = fiendishLegacies.map(
  ({ id, name, resistance, cantripId, cantripName, level3Id, level3Name, level5Id, level5Name }) => ({
    id: `tiefling-${id}`,
    speciesId: 'tiefling',
    name,
    traits: [
      {
        id: `tiefling-${id}-fiendish-legacy`,
        name: 'Fiendish Legacy',
        description: `You have Resistance to ${resistance} damage, and you know the ${cantripName} cantrip. When you reach character level 3, you always have the ${level3Name} spell prepared. Starting at character level 5, you always have the ${level5Name} spell prepared. You can cast each of these spells once without a spell slot, and you regain the ability to cast them in that way when you finish a Long Rest. You can also cast these spells using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for the spells you cast with this trait (choose when you select this legacy).`,
        effects: [
          {
            kind: 'grantSpells',
            castingAbility: 'choice',
            spells: [
              { spellId: cantripId },
              { spellId: level3Id, atLevel: 3 },
              { spellId: level5Id, atLevel: 5 },
            ],
          },
        ],
      },
    ],
  }),
);
